# HypeDuel SDK

A TypeScript SDK for integrating HypeDuel match services into your Node.js application. This SDK handles webhook endpoints and automatically establishes WebSocket connections to the HypeDuel match server.

## Features

✨ **Framework Agnostic** - Works with Express, Fastify, Next.js, Koa, Hono, and more  
🔌 **WebSocket Auto-Connect** - Automatically connects to match server when webhook received  
📦 **TypeScript First** - Full type safety with comprehensive type definitions  
🎯 **Event-Driven** - Listen to match events with a simple event emitter API  
🛠️ **Easy Integration** - Drop-in handlers for popular frameworks  
🎮 **Match Lifecycle** - Simple methods to begin, update, and end matches  
🤝 **Team Configuration** - Define team compositions via callback when requested  

## Installation

```bash
npm install @b3dotfun/hypeduel-sdk
# or
pnpm add @b3dotfun/hypeduel-sdk
# or
yarn add @b3dotfun/hypeduel-sdk
```

## Quick Start

### Express.js Example

```typescript
import express from 'express';
import { HypeDuelSDK, createExpressHandler } from '@b3dotfun/hypeduel-sdk';

const app = express();
app.use(express.json());

// Initialize SDK
const sdk = new HypeDuelSDK({
    gameSecret: 'your-game-secret', // Required for webhook verification
    debug: true,
    // Called when HypeDuel requests team configurations
    onRequestTeams: async () => {
        return [
            {
                id: 'team1',
                name: 'Team 1',
                agents: [{ id: 'player', count: 1 }]
            },
            {
                id: 'team2',
                name: 'Team 2',
                agents: [{ id: 'opponent', count: 1 }]
            }
        ];
    },
    // Called when a match starts
    onMatchStart: async (matchClient) => {
        console.log(`Match started: ${matchClient.matchId}`);
        
        matchClient.beginMatch();
        
        matchClient.sendStateUpdate([{
            transforms: [],
            state: { scores: { player1: 0, player2: 0 } },
            timeSinceLastFrame: 0
        }]);
        
        // End the match when done
        // matchClient.endMatch();
    }
});

// Mount webhook handler
app.post('/webhook/hypeduel', createExpressHandler(sdk));

app.listen(3067, () => console.log('Server running on port 3067'));
```

### Next.js API Route

```typescript
// pages/api/webhook/hypeduel.ts
import { HypeDuelSDK, createNextHandler } from '@b3dotfun/hypeduel-sdk';

const sdk = new HypeDuelSDK({
    debug: true,
    onMatchStart: async (matchClient) => {
        // Your match handling logic
    }
});

export default createNextHandler(sdk);
```

### Fastify Example

```typescript
import Fastify from 'fastify';
import { HypeDuelSDK, createFastifyHandler } from '@b3dotfun/hypeduel-sdk';

const fastify = Fastify();
const sdk = new HypeDuelSDK({ debug: true });

fastify.post('/webhook/hypeduel', createFastifyHandler(sdk));

fastify.listen({ port: 3067 });
```

## Core Concepts

### 1. SDK Initialization

Create an SDK instance with configuration:

```typescript
import { HypeDuelSDK } from '@b3dotfun/hypeduel-sdk';

const sdk = new HypeDuelSDK({
    gameSecret: process.env.HYPEDUEL_GAME_SECRET, // Required for webhook verification
    debug: true, // Enable debug logging
    // Called when HypeDuel requests team configurations
    onRequestTeams: async () => {
        // Return array of teams with their agent compositions
        return [
            {
                id: 'team1',
                name: 'Team 1',
                agents: [{ id: 'player', count: 1 }],
                metadata: { color: 'blue' } // Optional
            },
            {
                id: 'team2',
                name: 'Team 2',
                agents: [{ id: 'opponent', count: 1 }],
                metadata: { color: 'red' } // Optional
            }
        ];
    },
    // Called when a match starts and WebSocket connects
    onMatchStart: async (matchClient) => {
        // Your match handling logic
    },
    // Global error handler
    onError: (error) => {
        console.error('SDK Error:', error);
    }
});
```

### 2. Webhook Handling

The SDK handles two types of webhooks from HypeDuel:

1. **Team Request** (`request_teams`) - Called when HypeDuel needs team configurations
2. **Match Start** (`start_match`) - Called when a match begins

The SDK provides framework-specific adapters:

- `createExpressHandler(sdk)` - Express.js
- `createFastifyHandler(sdk)` - Fastify
- `createKoaHandler(sdk)` - Koa
- `createNextHandler(sdk)` - Next.js
- `createHttpHandler(sdk)` - Node.js HTTP
- `createHonoHandler(sdk)` - Hono

**Team Request Webhook:**
1. Receives webhook from HypeDuel requesting team configurations
2. Calls your `onRequestTeams` callback
3. Returns team structure to HypeDuel

**Match Start Webhook:**
1. Receives webhook payload with match information
2. Creates a `MatchClient` instance
3. Connects to HypeDuel server via WebSocket
4. Authenticates using the match token
5. Calls your `onMatchStart` callback

### 3. Team Configuration

Define team structures via the `onRequestTeams` callback:

```typescript
const sdk = new HypeDuelSDK({
    gameSecret: 'your-game-secret',
    onRequestTeams: async () => {
        return [
            {
                id: 'attackers',
                name: 'Attackers',
                agents: [
                    { id: 'warrior', count: 2 },
                    { id: 'archer', count: 1 }
                ],
                metadata: { color: 'red' }
            },
            {
                id: 'defenders',
                name: 'Defenders',
                agents: [
                    { id: 'shield', count: 2 },
                    { id: 'healer', count: 1 }
                ],
                metadata: { color: 'blue' }
            }
        ];
    }
});
```

Each team can have:
- Multiple agent types with specified counts
- Optional metadata for custom properties
- Unique IDs and display names

### 4. Match Client

The `MatchClient` handles WebSocket communication and provides convenient methods for match lifecycle:

```typescript
// Begin a match
matchClient.beginMatch();

// Send state updates
matchClient.sendStateUpdate([{
    transforms: [{
        id: 1,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 }
    }],
    state: {
        scores: { player1: 10, player2: 8 },
        time: 60
    },
    timeSinceLastFrame: 16.67 // milliseconds
}]);

// End a match
matchClient.endMatch();

// Listen for events
matchClient.on('connect', () => {
    console.log('Connected to match server');
});

matchClient.on('error', (error) => {
    console.error('WebSocket error:', error);
});

matchClient.on('close', () => {
    console.log('Connection closed');
});

// Check connection status
if (matchClient.isConnected()) {
    console.log('Connected!');
}

// Manually disconnect
matchClient.disconnect();
```

#### Automatic State Tracking

For games that need to send regular state updates, you can use `trackState()`:

```typescript
const gameState = {
    transforms: [],
    state: { scores: { player1: 0, player2: 0 } },
    timeSinceLastFrame: 0
};

// Automatically send state every 100ms
matchClient.trackState(gameState, 100);

// Update the state object directly - changes will be sent automatically
gameState.state.scores.player1 = 10;
```

### 5. Managing Active Matches

Track and manage multiple active matches:

```typescript
// Get a specific match
const match = sdk.getMatch('match-123');
if (match) {
    console.log(`Match ${match.matchId} is active`);
}

// Get all active matches
const activeMatches = sdk.getActiveMatches();
console.log(`${activeMatches.length} matches currently active`);

// Disconnect a specific match
sdk.disconnectMatch('match-123');

// Disconnect all matches (useful for cleanup)
sdk.disconnectAll();
```

## Complete Example

Here's a complete example showing a simple game implementation:

```typescript
import express from 'express';
import { HypeDuelSDK, createExpressHandler } from '@b3dotfun/hypeduel-sdk';

const app = express();
app.use(express.json());

const sdk = new HypeDuelSDK({
    gameSecret: process.env.HYPEDUEL_GAME_SECRET || 'your-game-secret',
    debug: true,
    // Define team configurations
    onRequestTeams: async () => {
        return [
            {
                id: 'team_red',
                name: 'Red Team',
                agents: [{ id: 'player', count: 1 }],
                metadata: { color: 'red' }
            },
            {
                id: 'team_blue',
                name: 'Blue Team',
                agents: [{ id: 'player', count: 1 }],
                metadata: { color: 'blue' }
            }
        ];
    },
    // Handle match start
    onMatchStart: async (matchClient) => {
        console.log(`Match started: ${matchClient.matchId}`);
        
        // Begin the match
        matchClient.beginMatch();
        
        // Initialize game state
        const gameState = {
            transforms: [],
            state: {
                scores: { team_red: 0, team_blue: 0 },
                time: 0
            },
            timeSinceLastFrame: 0
        };
        
        // Track state updates every 100ms
        matchClient.trackState(gameState, 100);
        
        // Simulate a game loop
        let gameTime = 0;
        const gameLoop = setInterval(() => {
            gameTime++;
            gameState.state.time = gameTime;
            
            // Random score updates
            if (Math.random() > 0.7) {
                gameState.state.scores.team_red++;
            }
            
            // End game after 30 seconds
            if (gameTime >= 30) {
                clearInterval(gameLoop);
                matchClient.endMatch();
                matchClient.disconnect();
            }
        }, 1000);
        
        // Handle disconnection
        matchClient.on('close', () => {
            clearInterval(gameLoop);
            console.log('Match disconnected');
        });
    },
    onError: (error) => {
        console.error('SDK Error:', error);
    }
});

app.post('/webhook/hypeduel', createExpressHandler(sdk));

app.listen(3067, () => {
    console.log('Server running on port 3067');
});
```

## Data Types

### SimFrame

The core data structure for sending game state:

```typescript
interface SimFrame {
    // Array of object transforms
    transforms: Array<{
        id: number;
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number; w: number };
    }>;
    
    // Game state (scores, time, custom data)
    state?: {
        scores?: Record<string, number>;
        announcedEvents?: string[];
        time?: number;
        [key: string]: any; // Custom properties
    };
    
    // Time elapsed since last frame (ms)
    timeSinceLastFrame: number;
}
```

### Webhook Payload

Your webhook endpoint receives this structure:

```typescript
interface WebhookPayload {
    callType: 'start_match' | 'request_teams';  // Type of webhook
    jwtData: string;          // JWT for verification
    
    // For start_match:
    matchId?: string;         // Unique match identifier
    authToken?: string;       // Authentication token for WebSocket
    wsUrl?: string;           // WebSocket server URL
}
```

### Team Configuration Types

```typescript
interface GameMatchTeam {
    id: string;                          // Unique team identifier
    name: string;                        // Display name
    agents: GameMatchTeamAgent[];        // Array of agents in team
    metadata?: Record<string, any>;      // Optional custom properties
}

interface GameMatchTeamAgent {
    id: string;                          // Agent type identifier
    count: number;                       // Number of this agent type
    metadata?: Record<string, any>;      // Optional custom properties
}
```

## Examples

The `examples/` directory contains working examples:

- `express-example.ts` - Complete Express.js integration with a demo game

To run the example:

```bash
pnpm example
```

## API Reference

### HypeDuelSDK

#### Constructor Options

```typescript
interface SDKConfig {
    gameSecret: string;                         // Required: Game secret for webhook verification
    onMatchStart?: (matchClient: MatchClient) => void | Promise<void>;  // Called when match starts
    onRequestTeams?: () => Promise<GameMatchTeam[]>;  // Called when teams are requested
    onError?: (error: Error) => void;          // Global error handler
    debug?: boolean;                           // Enable debug logging
}
```

#### Methods

- `handleWebhook(payload: WebhookPayload): Promise<MatchClient | GameMatchTeam[]>` - Process webhook (returns MatchClient for start_match, teams array for request_teams)
- `getMatch(matchId: string): MatchClient | undefined` - Get active match by ID
- `getActiveMatches(): MatchClient[]` - Get all active matches
- `disconnectMatch(matchId: string): void` - Disconnect specific match
- `disconnectAll(): void` - Disconnect all matches

### MatchClient

#### Properties

- `authToken: string` - Match authentication token
- `matchId: string` - Match identifier
- `wsUrl: string` - WebSocket server URL

#### Methods

- `connect(): Promise<void>` - Connect to WebSocket server
- `send(message: OutgoingMessage): void` - Send message to server
- `on(event: string, handler: Function): void` - Register event listener
- `disconnect(): void` - Close WebSocket connection
- `isConnected(): boolean` - Check connection status

## Development

### Build

```bash
pnpm build
```

### Watch Mode

```bash
pnpm dev
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.


