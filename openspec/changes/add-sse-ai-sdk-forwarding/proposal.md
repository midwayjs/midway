# Change: Add AI SDK-compatible SSE forwarding for HTTP responses

## Why
Midway users often build a Node.js service as a secure AI gateway: the backend performs authentication, injects hidden prompts and tools, calls OpenAI or Anthropic SDKs, and streams the model result to a browser or frontend runtime.

The current `HttpServerResponse().sse()` API can send manually constructed SSE messages, but it does not provide a stable way to forward `AsyncIterable` streaming results from AI SDKs while preserving provider-compatible SSE semantics. Users must repeatedly write provider-specific stream loops and risk producing SSE frames that frontend AI clients cannot parse.

## What Changes
- Add a forwarding API on `ServerSendEventStream` so users can call `new HttpServerResponse(ctx).sse().forward(upstream, options)`.
- Support provider-compatible SSE output for OpenAI and Anthropic SDK stream events.
- Preserve the existing `new HttpServerResponse(ctx).sse()` usage pattern and existing `send()` behavior.
- Add protocol-oriented options such as `protocol: 'openai' | 'anthropic' | 'eventsource'`.
- Add cancellation/error/end handling so client disconnects can abort upstream SDK requests and streams finish predictably.
- Keep core responsible for transport framing only; core does not parse thoughts, interpret thinking content, mutate prompts, or translate OpenAI and Anthropic semantic event models.

## Impact
- Affected specs: `http-response-sse-forwarding`
- Affected code:
  - `packages/core/src/response/sse.ts`
  - `packages/core/src/response/http.ts`
  - `packages/core/src/interface.ts`
  - `packages/core/test/response/http.test.ts`
- Backward compatibility: existing `sse().send()` and `sse().sendEnd()` behavior remains supported.

## User API Draft

```ts
const upstream = await openai.responses.create({
  model: 'gpt-5.2',
  input,
  stream: true,
});

const sse = new HttpServerResponse(ctx).sse();
sse.forward(upstream, {
  protocol: 'openai',
});

return sse;
```

```ts
const upstream = anthropic.messages.stream({
  model: 'claude-opus-4-7',
  max_tokens: 4096,
  messages,
  thinking: {
    type: 'enabled',
    budget_tokens: 1024,
  },
});

const sse = new HttpServerResponse(ctx).sse();
sse.forward(upstream, {
  protocol: 'anthropic',
});

return sse;
```

The frontend can then use an OpenAI/Anthropic-compatible SSE parser or AI client logic against the Midway endpoint, while the backend keeps credentials, prompt assembly, and tool configuration private.
