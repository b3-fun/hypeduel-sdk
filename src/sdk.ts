import { MatchClient } from './match-client';
import { SDKConfig, WebhookPayload } from './types';
import jwt from 'jsonwebtoken';

/**
 * HypeDuelSDK - Main SDK class for integrating HypeDuel match services
 * 
 * @example
 * ```typescript
 * const sdk = new HypeDuelSDK({
 *   debug: true,
 *   onMatchStart: async (matchClient) => {
 *     console.log(`Match started: ${matchClient.matchId}`);
 *     matchClient.beginMatch();
 *   }
 * });
 * ```
 */
export class HypeDuelSDK {
    private readonly config: SDKConfig;
    private readonly activeMatches: Map<string, MatchClient> = new Map();

    constructor(config: SDKConfig) {
        this.config = config;
    }

    /**
     * Core webhook handler - framework agnostic
     * Creates a MatchClient, connects to the WebSocket server, and calls onMatchStart
     * 
     * @param payload - Webhook payload containing matchId, authToken, and wsUrl
     * @returns Promise<MatchClient> - The connected match client
     * @throws Error if payload validation fails or connection fails
     */
    async handleWebhook(payload: WebhookPayload): Promise<MatchClient> {
        try {
            this.log(`Received webhook for match: ${payload.matchId}`);

            if (!payload.jwtData) {
                throw new Error('Missing jwtData in webhook payload');
            }
            // Verify JWT
            try {
                const decoded = jwt.verify(payload.jwtData, this.config.gameSecret) as any;
                if (decoded.matchId !== payload.matchId) {
                    throw new Error('Invalid JWT token');
                }
            } catch (err){
                throw new Error('Invalid JWT token');
            }
            // Validate payload
            this.validatePayload(payload);

            // Check if match already exists
            if (this.activeMatches.has(payload.matchId)) {
                this.log(`Match ${payload.matchId} already exists, returning existing client`);
                return this.activeMatches.get(payload.matchId)!;
            }

            // Create match client
            const matchClient = new MatchClient(payload);

            // Store active match
            this.activeMatches.set(payload.matchId, matchClient);

            // Connect to WebSocket
            await matchClient.connect();

            this.log(`Match client connected for: ${payload.matchId}`);

            // Call user's onMatchStart callback if provided
            if (this.config.onMatchStart) {
                try {
                    await this.config.onMatchStart(matchClient);
                } catch (error) {
                    this.log(`Error in onMatchStart callback: ${(error as Error).message}`, true);
                    throw error;
                }
            }

            // Clean up on disconnect
            matchClient.on('close', () => {
                this.activeMatches.delete(payload.matchId);
                this.log(`Match client disconnected: ${payload.matchId}`);
            });

            // Handle errors
            matchClient.on('error', (error: Error) => {
                this.handleError(error);
            });

            return matchClient;
        } catch (error) {
            this.handleError(error as Error);
            throw error;
        }
    }

    /**
     * Validate webhook payload
     */
    private validatePayload(payload: WebhookPayload): void {
        if (!payload.authToken) {
            throw new Error('Missing authToken in webhook payload');
        }
        if (!payload.matchId) {
            throw new Error('Missing matchId in webhook payload');
        }
        if (!payload.wsUrl) {
            throw new Error('Missing wsUrl in webhook payload');
        }
    }

    /**
     * Get active match client by ID
     */
    getMatch(matchId: string): MatchClient | undefined {
        return this.activeMatches.get(matchId);
    }

    /**
     * Get all active matches
     */
    getActiveMatches(): MatchClient[] {
        return Array.from(this.activeMatches.values());
    }

    /**
     * Disconnect a specific match
     */
    disconnectMatch(matchId: string): void {
        const match = this.activeMatches.get(matchId);
        if (match) {
            match.disconnect();
            this.activeMatches.delete(matchId);
        }
    }

    /**
     * Disconnect all matches
     */
    disconnectAll(): void {
        this.activeMatches.forEach(match => match.disconnect());
        this.activeMatches.clear();
    }

    /**
     * Handle errors
     */
    private handleError(error: Error): void {
        this.log(`Error: ${error.message}`, true);
        if (this.config.onError) {
            this.config.onError(error);
        }
    }

    /**
     * Log messages if debug is enabled
     */
    private log(message: string, isError: boolean = false): void {
        if (this.config.debug) {
            if (isError) {
                console.error(`[HypeDuel SDK] ${message}`);
            } else {
                console.log(`[HypeDuel SDK] ${message}`);
            }
        }
    }
}

