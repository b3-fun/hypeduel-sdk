# Hypeduel SDK

A TypeScript SDK for interacting with the Hypeduel API via WebSocket connections.

## Installation

```bash
npm install @b3dotfun/hypeduel-sdk
# or
pnpm add @b3dotfun/hypeduel-sdk
# or
yarn add @b3dotfun/hypeduel-sdk
```

## Usage

```typescript
import { 
  StartMatchMessage, 
  StopMatchMessage, 
  SendServerInputMessage,
  isUnityMessage,
  isClientMessage
} from '@b3dotfun/hypeduel-sdk';

// Use the types in your WebSocket implementation
const startMatch: StartMatchMessage = {
  messageType: 'start_match',
  gameSlug: 'my-game',
  matchId: 'match-123'
};
```

## Features

- Full TypeScript support with type definitions
- WebSocket message types for Hypeduel API
- Type guards for message validation
- Support for Unity and client messages

## Development

### Build

```bash
pnpm build
```

### Watch Mode

```bash
pnpm dev
```



