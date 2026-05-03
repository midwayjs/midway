# Implementation Tasks

## 1. API And Types
- [x] 1.1 Add `ServerSendEventForwardProtocol` type.
- [x] 1.2 Add `ServerSendEventForwardOptions<T, CTX>` interface.
- [x] 1.3 Add `forward<T>()` method declaration to `ServerSendEventStream`.
- [x] 1.4 Keep existing `ServerSendEventStreamOptions` and `ServerSendEventMessage` behavior compatible.

## 2. Forwarding Implementation
- [x] 2.1 Implement async iterable forwarding in `packages/core/src/response/sse.ts`.
- [x] 2.2 Implement provider-compatible Anthropic SSE framing.
- [x] 2.3 Implement OpenAI-compatible SSE framing and terminal `[DONE]` behavior.
- [x] 2.4 Implement generic `eventsource` framing.
- [x] 2.5 Implement `transform` filtering.
- [x] 2.6 Implement client-close abort behavior with optional `AbortController`.
- [x] 2.7 Preserve existing headers, socket keep-alive, and manual `send()` behavior.

## 3. Tests
- [x] 3.1 Add tests for generic async iterable forwarding.
- [x] 3.2 Add tests for Anthropic event framing and parser compatibility.
- [x] 3.3 Add tests for OpenAI event framing and `[DONE]`.
- [x] 3.4 Add tests for transform returning `null`.
- [x] 3.5 Add tests for aborting upstream work on client close.
- [x] 3.6 Run `pnpm -C packages/core test`.

## 4. Validation
- [x] 4.1 Run `openspec validate add-sse-ai-sdk-forwarding --strict --no-interactive`.
- [x] 4.2 Review final API naming before implementation approval.
