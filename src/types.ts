// WebSocket Message Types for Unity ML Instancer Service

// Base message interface
export interface BaseMessage {
    messageType: string;
}

export interface MatchUser {
    usernameOrAddress: string;
    id: string;
}

// Authentication Messages
export interface AuthenticateMessage extends BaseMessage {
    messageType: 'authenticate';
    token: string;
}

// Unity Messages (sent from Unity processes)
export interface InitFramesMessage extends BaseMessage {
    messageType: 'init_frames';
    matchId?: string; // Optional - set by handler
}

export interface EndFramesMessage extends BaseMessage {
    messageType: 'end_frames';
    matchId?: string; // Optional - set by handler
}

export interface SceneFramesMessage extends BaseMessage {
    messageType: 'scene_frames';
    frames: any[]; // Array of frame data
    matchId?: string; // Optional - set by handler
}

// External Client Messages (sent from external clients)
export interface SubscribeStreamMessage extends BaseMessage {
    messageType: 'subscribe_stream';
}

export interface UnsubscribeStreamMessage extends BaseMessage {
    messageType: 'unsubscribe_stream';
}

export interface StartMatchMessage extends BaseMessage {
    messageType: 'start_match';
    gameSlug: string;
    matchId: string;
}

export interface RunHyperSimMessage extends BaseMessage {
    messageType: 'run_hyper_sim';
    gameSlug: string;
    matchId: string;
}

export interface StopMatchMessage extends BaseMessage {
    messageType: 'stop_match';
    matchId: string;
}

export interface ResetMessage extends BaseMessage {
    messageType: 'reset';
}

export interface SendServerInputMessage extends BaseMessage {
    messageType: 'server_input';
    matchId: string;
    data: {
        input: any;
        user: MatchUser
    };
}

export interface SendBoostMessage extends BaseMessage {
    messageType: 'match_boost';
    matchId: string;
    data: {
        boostId: number;
        user: MatchUser;
        metadata: any;
    }
}

export interface RequestServerStatusMessage extends BaseMessage {
    messageType: 'request_server_status';
}

export interface ServerStatusResponse extends BaseMessage {
    messageType: 'server_status';
    status: 'init' | 'ready' | 'shutting_down';
}

// Server Response Messages (sent by server to clients)
export interface AuthSuccessResponse {
    type: 'auth_success';
}

export interface SubscriptionConfirmedResponse {
    type: 'subscription_confirmed';
    message: string;
}

export interface UnsubscriptionConfirmedResponse {
    type: 'unsubscription_confirmed';
    message: string;
}

export interface MatchStartedResponse {
    type: 'match_started';
    matchId: string;
    message: string;
}

export interface MatchStoppedResponse {
    type: 'match_stopped';
    matchId: string;
    message: string;
}

export interface ResetResponse {
    type: 'reset';
    message: string;
}

export interface ErrorResponse {
    type: 'error';
    message: string;
}

// Union type for all incoming messages
export type OutgoingMessage =
    | AuthenticateMessage
    | InitFramesMessage
    | EndFramesMessage
    | SceneFramesMessage
    | SubscribeStreamMessage
    | UnsubscribeStreamMessage
    | StartMatchMessage
    | RunHyperSimMessage
    | StopMatchMessage
    | ResetMessage
    | SendServerInputMessage
    | SendBoostMessage
    | RequestServerStatusMessage;

// Union type for all outgoing response messages
export type ResponseMessage =
    | AuthSuccessResponse
    | SubscriptionConfirmedResponse
    | UnsubscriptionConfirmedResponse
    | MatchStartedResponse
    | MatchStoppedResponse
    | ResetResponse
    | ErrorResponse
    | ServerStatusResponse;

export type Message = OutgoingMessage | ResponseMessage;