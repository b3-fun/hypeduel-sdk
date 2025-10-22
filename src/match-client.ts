import WebSocket from 'ws';
import { AuthenticateMessage, EndFramesMessage, InitFramesMessage, OutgoingMessage, ResponseMessage, SceneFramesMessage, SimFrame, StartMatchWebhookPayload } from "./types";

/**
 * Event map for type-safe event handling
 */
export interface MatchClientEvents {
    connect: () => void;
    close: () => void;
    error: (error: Error | any) => void;
}

type EventName = keyof MatchClientEvents;

export class MatchClient {
    readonly authToken: string;
    readonly matchId: string;
    readonly wsUrl: string;
    
    private websocket: WebSocket | null = null;
    private connected: boolean = false;
    private messageQueue: OutgoingMessage[] = [];
    private eventHandlers: Map<EventName, Function[]> = new Map();
    private stateIntervalId: NodeJS.Timeout | null = null;
    private trackedState: SimFrame | null = null;

    constructor(webhookPayload: StartMatchWebhookPayload) {
        this.authToken = webhookPayload.authToken;
        this.matchId = webhookPayload.matchId;
        this.wsUrl = webhookPayload.wsUrl;
    }

    /**
     * Connect to the WebSocket server
     */
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.websocket = new WebSocket(this.wsUrl);

                this.websocket.on('open', () => {
                    this.connected = true;
                    this.authenticate();
                    this.flushMessageQueue();
                    this.emit('connect');
                    resolve();
                });

                this.websocket.on('message', (data: WebSocket.Data) => {
                    this.handleMessage(data.toString());
                });

                this.websocket.on('error', (error) => {
                    this.emit('error', error);
                    reject(error);
                });

                this.websocket.on('close', () => {
                    this.connected = false;
                    this.emit('close');
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Send authentication message with auth token
     */
    private authenticate(): void {
        this._send({
            messageType: 'authenticate',
            token: this.authToken
        } as AuthenticateMessage);
    }

    /**
     * Begin a match by sending init_frames message
     */
    beginMatch(): void {
        this._send({
            messageType: 'init_frames',
        } as InitFramesMessage);
    }
    
    /**
     * Send state update frames to the server
     * @param frames - Array of SimFrame objects containing game state
     */
    sendStateUpdate(frames: SceneFramesMessage['frames']): void {
        this._send({
            messageType: 'scene_frames',
            frames
        } as SceneFramesMessage);
    }

    /**
     * End a match by sending end_frames message
     */
    endMatch(): void {
        this._send({
            messageType: 'end_frames',
        } as EndFramesMessage);
    }

    /**
     * Track a game state object and automatically send updates at specified intervals
     * @param state - The game state object extending SimFrame to track
     * @param intervalMs - The interval in milliseconds at which to send state updates
     */
    trackState(state: SimFrame, intervalMs: number): void {
        // Clear any existing interval
        if (this.stateIntervalId) {
            clearInterval(this.stateIntervalId);
        }

        // Store the state reference
        this.trackedState = state;

        // Set up interval to send state updates
        this.stateIntervalId = setInterval(() => {
            if (this.trackedState) {
                this.sendStateUpdate([this.trackedState]);
            }
        }, intervalMs);
    }

    /**
     * Send a message to the server
     */ 
    _send(message: OutgoingMessage): void {
        if (!this.connected || !this.websocket) {
            // Queue message if not connected yet
            this.messageQueue.push(message);
            return;
        }

        try {
            this.websocket.send(JSON.stringify(message));
        } catch (error) {
            this.emit('error', error);
        }
    }

    /**
     * Flush queued messages after connection
     */
    private flushMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                this._send(message);
            }
        }
    }

    /**
     * Handle incoming messages from server
     */
    private handleMessage(data: string): void {
        try {
            const message: ResponseMessage = JSON.parse(data);
            // Ignore non-object messages (e.g., heartbeat messages like 0)
            if (typeof message !== 'object' || message === null) {
                return;
            }
            // Messages are handled internally, no event emission
        } catch (error) {
            this.emit('error', error);
        }
    }

    /**
     * Register event handler
     */
    on<E extends EventName>(event: E, handler: MatchClientEvents[E]): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);
    }

    /**
     * Emit event to registered handlers
     */
    private emit<E extends EventName>(event: E, ...args: any[]): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(...args));
        }
    }

    /**
     * Disconnect from server
     */
    disconnect(): void {
        // Clear state tracking interval if active
        if (this.stateIntervalId) {
            clearInterval(this.stateIntervalId);
            this.stateIntervalId = null;
            this.trackedState = null;
        }

        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
            this.connected = false;
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connected;
    }
}