# Design: AI SDK SSE forwarding

## Context
`HttpServerResponse.sse()` currently returns a `ServerSendEventStream`, and users manually call `send()` with `ServerSendEventMessage`. OpenAI and Anthropic Node SDK streaming APIs commonly expose SDK-level async iterables of semantic events rather than raw network bytes. A Midway service should be able to convert those events back into provider-compatible SSE frames so frontend code can parse the gateway endpoint as if it were speaking the provider's streaming protocol.

## Goals
- Keep the primary API on `ServerSendEventStream`, preserving `new HttpServerResponse(ctx).sse()` as the main construction style.
- Forward `AsyncIterable` SDK stream events to HTTP SSE.
- Produce provider-compatible wire frames for OpenAI and Anthropic where protocol behavior is known.
- Keep provider-specific behavior minimal and explicit through `protocol`.
- Abort upstream work when the client connection closes when an `AbortController` is supplied.
- Preserve existing manual `send()` behavior.

## Non-Goals
- Do not convert OpenAI events into Anthropic events or Anthropic events into OpenAI events.
- Do not interpret or extract `thought`, `thinking`, reasoning summaries, tool call content, or prompt metadata.
- Do not require OpenAI or Anthropic SDK dependencies in `@midwayjs/core`.
- Do not introduce `ctx.response.sseForward()` as the required user style.

## API Shape

```ts
export type ServerSendEventForwardProtocol =
  | 'eventsource'
  | 'openai'
  | 'anthropic';

export interface ServerSendEventForwardOptions<
  T = unknown,
  CTX extends IMidwayContext = IMidwayContext,
> {
  /**
   * Controls the SSE wire compatibility rules.
   */
  protocol?: ServerSendEventForwardProtocol;

  /**
   * Called before a chunk is serialized. Returning null drops the chunk.
   */
  transform?: (chunk: T, ctx: CTX) => T | null | Promise<T | null>;

  /**
   * Aborts upstream provider requests when the client closes the HTTP request.
   */
  abortController?: AbortController;

  /**
   * Controls whether a terminal close event is emitted for eventsource mode.
   */
  closeEvent?: string | false;
}
```

```ts
class ServerSendEventStream<CTX extends IMidwayContext> extends Transform {
  forward<T>(
    source: AsyncIterable<T>,
    options?: ServerSendEventForwardOptions<T, CTX>
  ): Promise<void>;
}
```

## Protocol Semantics

### `eventsource`
The generic mode serializes each SDK chunk as `data: <json>`. This mode is intended for browser `EventSource` or custom frontend parsers. If a chunk has a string `type` field, implementations may emit it as `event: <type>` only when this is explicitly exposed as an option during implementation review; the default should remain conservative.

### `anthropic`
The Anthropic mode serializes each SDK event as:

```txt
event: <chunk.type>
data: <JSON chunk>

```

This preserves event names such as `message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, `message_delta`, `message_stop`, and `error`.

### `openai`
The OpenAI mode serializes SDK event chunks as data frames compatible with OpenAI stream consumers. Chat Completions-style chunks must be serialized as data-only SSE frames and finish with `data: [DONE]` when the source completes. Responses-style typed events require implementation-time verification against the current SDK behavior before finalizing whether event names are emitted or only JSON `data` frames are used.

The implementation must avoid inventing synthetic provider fields. If a provider SDK event is already a provider event object, it is serialized as-is unless `transform` changes it.

## Error And Close Handling
- Existing SSE headers and socket keep-alive behavior continue to be used.
- If `forward()` throws, it sends an SSE error using existing `sendError()` behavior and ends the stream.
- When the client request closes, `forward()` aborts `options.abortController` if provided and ends the stream.
- Completion behavior is protocol-aware:
  - `openai`: emits `[DONE]` when required by the selected OpenAI stream protocol.
  - `anthropic`: does not add synthetic provider stop events if the upstream already emitted provider stop events.
  - `eventsource`: may emit the existing configured close event unless `closeEvent: false`.

## Test Strategy
- Unit-test generic async iterable forwarding.
- Unit-test Anthropic event framing.
- Unit-test OpenAI completion framing.
- Unit-test `transform` filtering.
- Unit-test upstream abort on client close.
- Unit-test backward compatibility for existing `sse().send()` tests.
