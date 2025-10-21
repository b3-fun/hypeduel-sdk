import express from 'express';
import { HypeDuelSDK, createExpressHandler } from '../src/index';

const app = express();
app.use(express.json());

/**
 * DemoGame simulates a simple odds-vs-evens game.
 * - When started, picks a random number 0-100 every second.
 * - If odd, adds one to 'odds' score; if even, adds one to 'evens'.
 * - Notifies via `onScoreChange` callback whenever the scores update.
 * - When a score reaches 10, ends game and fires `onGameEnd` callback.
 */
class DemoGame {
    private oddsScore: number = 0;
    private evensScore: number = 0;
    private intervalId: NodeJS.Timeout | null = null;
    private onGameEnd: (winner: 'odds' | 'evens', oddsScore: number, evensScore: number) => void;
    private onScoreChange: (oddsScore: number, evensScore: number) => void;

    constructor(
        onGameEnd: (winner: 'odds' | 'evens', oddsScore: number, evensScore: number) => void,
        onScoreChange: (oddsScore: number, evensScore: number) => void
    ) {
        this.onGameEnd = onGameEnd;
        this.onScoreChange = onScoreChange;
        this.start();
    }

    private start() {
        this.intervalId = setInterval(() => {
            const num = Math.floor(Math.random() * 101);

            if (num % 2 === 0) {
                this.evensScore++;
            } else {
                this.oddsScore++;
            }

            // Call the score change callback
            this.onScoreChange(this.oddsScore, this.evensScore);

            if (this.evensScore >= 10) {
                this.stop('evens');
            } else if (this.oddsScore >= 10) {
                this.stop('odds');
            }
        }, 1000);
    }

    private stop(winner: 'odds' | 'evens') {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.onGameEnd(winner, this.oddsScore, this.evensScore);
    }
}

// Initialize the SDK with configuration
const sdk = new HypeDuelSDK({
    debug: true,
    webhookSecret: process.env.HYPEDUEL_WEBHOOK_SECRET,
    onMatchStart: async (matchClient) => {
        console.log(`Match started: ${matchClient.matchId}`);
        
        // The SDK automatically connects the websocket before calling onMatchStart
        // Send init frames to begin the match
        matchClient.beginMatch();
        
        const game = new DemoGame((winner, oddsScore, evensScore) => {
            console.log(`Game ended: ${winner} won with scores ${oddsScore} to ${evensScore}`);
            
            // Send final scene update with end state
            matchClient.sendStateUpdate([{
                transforms: [],
                state: {
                    scores: {
                        odds: oddsScore,
                        evens: evensScore
                    },
                    winner
                },
                timeSinceLastFrame: 0
            }]);
            
            // Send end frames to complete the match
            matchClient.endMatch();
            
            // Disconnect after ending the match
            matchClient.disconnect();
        }, (oddsScore, evensScore) => {
            console.log(`Score changed: odds ${oddsScore} to evens ${evensScore}`);
            
            // Send scene frames on every score update
            matchClient.sendStateUpdate([{
                transforms: [],
                state: {
                    scores: {
                        odds: oddsScore,
                        evens: evensScore
                    }
                },
                timeSinceLastFrame: 1000 // 1 second between updates
            }]);
        });
    },
    onError: (error) => {
        console.error('SDK Error:', error);
    }
});

// Mount the webhook handler
app.post('/webhook/hypeduel', createExpressHandler(sdk));

const PORT = process.env.PORT || 3067;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

