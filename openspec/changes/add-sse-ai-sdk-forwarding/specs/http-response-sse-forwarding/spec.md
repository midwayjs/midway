## ADDED Requirements

### Requirement: HTTP SSE stream shall forward AI SDK async iterables
`ServerSendEventStream` SHALL provide a `forward()` API that accepts an `AsyncIterable` source and writes each yielded chunk as Server-Sent Events through the existing `HttpServerResponse().sse()` stream.

#### Scenario: Forward OpenAI SDK stream from explicit response object
- **GIVEN** a user creates `const sse = new HttpServerResponse(ctx).sse()`
- **AND** an OpenAI SDK streaming call returns an `AsyncIterable`
- **WHEN** the user calls `sse.forward(upstream, { protocol: 'openai' })`
- **THEN** the stream writes OpenAI-compatible SSE frames to the HTTP response
- **AND** the user can return the same `sse` object from the request handler

#### Scenario: Forward Anthropic SDK stream from explicit response object
- **GIVEN** a user creates `const sse = new HttpServerResponse(ctx).sse()`
- **AND** an Anthropic SDK streaming call returns an `AsyncIterable`
- **WHEN** the user calls `sse.forward(upstream, { protocol: 'anthropic' })`
- **THEN** the stream writes Anthropic-compatible SSE frames to the HTTP response
- **AND** event names are preserved from each yielded SDK event's `type` field

### Requirement: SSE forwarding shall preserve provider-compatible wire semantics
The forwarding API SHALL use protocol-specific framing rules so frontend AI clients and provider-compatible parsers can consume the Midway endpoint without requiring a custom Midway-only event envelope.

#### Scenario: Anthropic event names are preserved
- **GIVEN** an Anthropic SDK chunk with `type: 'content_block_delta'`
- **WHEN** it is forwarded with `protocol: 'anthropic'`
- **THEN** the SSE frame contains `event: content_block_delta`
- **AND** the `data:` payload contains the original chunk JSON

#### Scenario: OpenAI stream completion is preserved
- **GIVEN** an OpenAI-compatible stream is forwarded with `protocol: 'openai'`
- **WHEN** the upstream async iterable completes normally
- **THEN** the SSE output includes the protocol-appropriate terminal marker such as `data: [DONE]` when required by the OpenAI-compatible stream format

#### Scenario: No Midway-specific envelope is added by default
- **GIVEN** an SDK event contains provider-specific fields
- **WHEN** it is forwarded with `protocol: 'openai'` or `protocol: 'anthropic'`
- **THEN** the forwarded `data:` payload preserves the provider event object
- **AND** no `{ provider, event, data }` wrapper is added unless a user transform explicitly creates one

### Requirement: SSE forwarding shall support generic EventSource mode
The forwarding API SHALL support a generic `eventsource` protocol for users who want browser `EventSource` or custom frontend parsers rather than provider-compatible clients.

#### Scenario: Generic chunks are serialized as JSON data frames
- **GIVEN** an async iterable yields plain JavaScript objects
- **WHEN** it is forwarded with `protocol: 'eventsource'`
- **THEN** each chunk is emitted as an SSE `data:` frame containing JSON

### Requirement: SSE forwarding shall expose transform and filtering hooks
The forwarding API SHALL allow users to transform or drop chunks before they are serialized while keeping transport framing in core.

#### Scenario: Transform drops a chunk
- **GIVEN** a user passes a `transform` function
- **AND** the transform returns `null` for one yielded chunk
- **WHEN** the stream is forwarded
- **THEN** that chunk is not written to the HTTP response
- **AND** following chunks continue to be forwarded

#### Scenario: Transform preserves provider compatibility
- **GIVEN** a user passes a `transform` function that returns a modified provider event object
- **WHEN** the modified event is forwarded with `protocol: 'anthropic'`
- **THEN** the event is still serialized with Anthropic-compatible SSE framing

### Requirement: SSE forwarding shall handle close, abort, and errors predictably
The forwarding API SHALL keep existing SSE response headers and socket behavior, abort upstream work when configured, and surface forwarding errors through existing SSE error behavior.

#### Scenario: Client close aborts upstream request
- **GIVEN** a user passes an `AbortController` in forward options
- **WHEN** the client closes the HTTP request before the upstream completes
- **THEN** the stream aborts the supplied controller
- **AND** the SSE stream ends

#### Scenario: Upstream error sends SSE error
- **GIVEN** the upstream async iterable throws an error
- **WHEN** it is being forwarded
- **THEN** the stream sends an SSE error using existing `sendError()` behavior
- **AND** the stream ends

### Requirement: Existing manual SSE API shall remain compatible
The new forwarding API SHALL NOT change existing `sse().send()`, `sse().sendEnd()`, header, or pipe behavior.

#### Scenario: Manual SSE send remains unchanged
- **GIVEN** existing code calls `new HttpServerResponse(ctx).sse().send({ data: 'hello' })`
- **WHEN** the stream is piped to the HTTP response
- **THEN** it emits the same SSE frame format as before this change
