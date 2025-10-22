// WebSocket Message Types for HypeDuel Match Service

/**
 * Base message interface for all WebSocket messages
 */
export interface BaseMessage {
    messageType: string;
}

/**
 * Represents a user in a match
 */
export interface MatchUser {
    usernameOrAddress: string;
    id: string;
}

/**
 * 3D Vector representation
 */
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

/**
 * Quaternion rotation representation
 */
export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 * Transform data for game objects
 */
export interface Transform {
    id: number;
    position: Vector3;
    rotation: Quaternion;
}

/**
 * Game state data
 */
export interface State {
    scores?: Record<string, number>;
    announcedEvents?: string[];
    time?: number;
    [key: string]: any; // Allow additional properties
}

/**
 * Single simulation frame containing transforms and state
 */
export interface SimFrame {
    transforms: Transform[];
    state?: State;
    timeSinceLastFrame: number;
}

// Authentication Messages
/**
 * Message to authenticate with the match server
 */
export interface AuthenticateMessage extends BaseMessage {
    messageType: 'authenticate';
    token: string;
}

// Unity Messages (sent from Unity processes)
/**
 * Message to initialize frame streaming
 */
export interface InitFramesMessage extends BaseMessage {
    messageType: 'init_frames';
    matchId?: string; // Optional - set by handler
}

/**
 * Message to end frame streaming
 */
export interface EndFramesMessage extends BaseMessage {
    messageType: 'end_frames';
    matchId?: string; // Optional - set by handler
}

/**
 * Message containing scene frame data
 */
export interface SceneFramesMessage extends BaseMessage {
    messageType: 'scene_frames';
    frames: SimFrame[]; // Array of frame data
    matchId?: string; // Optional - set by handler
}

// External Client Messages (sent from external clients)
/**
 * Message to subscribe to frame streaming
 */
export interface SubscribeStreamMessage extends BaseMessage {
    messageType: 'subscribe_stream';
}

/**
 * Message to unsubscribe from frame streaming
 */
export interface UnsubscribeStreamMessage extends BaseMessage {
    messageType: 'unsubscribe_stream';
}

/**
 * Message to start a match
 */
export interface StartMatchMessage extends BaseMessage {
    messageType: 'start_match';
    gameSlug: string;
    matchId: string;
    jwtData?: string;
}

/**
 * Message to stop a match
 */
export interface StopMatchMessage extends BaseMessage {
    messageType: 'stop_match';
    matchId: string;
}

/**
 * Message to reset the server
 */
export interface ResetMessage extends BaseMessage {
    messageType: 'reset';
}

/**
 * Message to send player input to the server
 */
export interface SendServerInputMessage extends BaseMessage {
    messageType: 'server_input';
    matchId: string;
    data: {
        input: any;
        user: MatchUser
    };
}

/**
 * Message to send a boost in a match
 */
export interface SendBoostMessage extends BaseMessage {
    messageType: 'match_boost';
    matchId: string;
    data: {
        boostId: number;
        user: MatchUser;
        metadata: any;
    }
}

/**
 * Message to request server status
 */
export interface RequestServerStatusMessage extends BaseMessage {
    messageType: 'request_server_status';
}

/**
 * Server status response
 */
export interface ServerStatusResponse extends BaseMessage {
    messageType: 'server_status';
    status: 'init' | 'ready' | 'shutting_down';
}

// Server Response Messages (sent by server to clients)
/**
 * Authentication success response
 */
export interface AuthSuccessResponse {
    type: 'auth_success';
}

/**
 * Stream subscription confirmed response
 */
export interface SubscriptionConfirmedResponse {
    type: 'subscription_confirmed';
    message: string;
}

/**
 * Stream unsubscription confirmed response
 */
export interface UnsubscriptionConfirmedResponse {
    type: 'unsubscription_confirmed';
    message: string;
}

/**
 * Match started response
 */
export interface MatchStartedResponse {
    type: 'match_started';
    matchId: string;
    message: string;
}

/**
 * Match stopped response
 */
export interface MatchStoppedResponse {
    type: 'match_stopped';
    matchId: string;
    message: string;
}

/**
 * Reset response
 */
export interface ResetResponse {
    type: 'reset';
    message: string;
}

/**
 * Error response from server
 */
export interface ErrorResponse {
    type: 'error';
    message: string;
}

/**
 * Union type for all outgoing messages (client → server)
 */
export type OutgoingMessage =
    | AuthenticateMessage
    | InitFramesMessage
    | EndFramesMessage
    | SceneFramesMessage
    | SubscribeStreamMessage
    | UnsubscribeStreamMessage
    | StartMatchMessage
    | StopMatchMessage
    | ResetMessage
    | SendServerInputMessage
    | SendBoostMessage
    | RequestServerStatusMessage;

/**
 * Union type for all incoming response messages (server → client)
 */
export type ResponseMessage =
    | AuthSuccessResponse
    | SubscriptionConfirmedResponse
    | UnsubscriptionConfirmedResponse
    | MatchStartedResponse
    | MatchStoppedResponse
    | ResetResponse
    | ErrorResponse
    | ServerStatusResponse;

/**
 * Union type for all messages
 */
export type Message = OutgoingMessage | ResponseMessage;

// Webhook Types
/**
 * Base webhook payload interface
 */
interface BaseWebhookPayload {
    callType: string;
    jwtData: string;
}

/**
 * Webhook payload for starting a match
 */
export interface StartMatchWebhookPayload extends BaseWebhookPayload {
    callType: 'start_match';
    matchId: string;
    authToken: string;
    wsUrl: string;
}

/**
 * Webhook payload for requesting teams
 */
export interface RequestTeamsWebhookPayload extends BaseWebhookPayload {
    callType: 'request_teams';
    matchId: string;
}

/**
 * Union type for all webhook payloads received from HypeDuel
 */
export type WebhookPayload = StartMatchWebhookPayload | RequestTeamsWebhookPayload;

/**
 * SDK configuration options
 */
/**
 * Represents an agent in a game match team
 */
export interface GameMatchTeamAgent {
    id: string;
    metadata?: Record<string, any>;
    count: number;
}

/**
 * Represents a team in a game match
 */
export interface GameMatchTeam {
    id: string;
    name: string;
    agents: GameMatchTeamAgent[];
    metadata?: Record<string, any>;
}

export interface SDKConfig {
    /** Webhook verification secret */
    gameSecret: string;
    /** Callback invoked when a match starts and WebSocket connects */
    onMatchStart?: (matchClient: any) => void | Promise<void>;
    /** Callback invoked when teams are requested */
    onRequestTeams?: () => Promise<GameMatchTeam[]>;
    /** Global error handler */
    onError?: (error: Error) => void;
    /** Enable debug logging */
    debug?: boolean;
}