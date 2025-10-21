// Export core SDK
export { HypeDuelSDK } from './sdk';

// Export MatchClient
export { MatchClient } from './match-client';

// Export framework adapters
export {
    createExpressHandler,
    createFastifyHandler,
    createKoaHandler,
    createNextHandler,
    createHttpHandler,
    createHonoHandler
} from './adapters';

// Export all types
export * from './types';
