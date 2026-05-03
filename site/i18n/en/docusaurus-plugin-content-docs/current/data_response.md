# Data Response

Since v3.17.0, Midway provides `ServerResponse` and `HttpServerResponse`.

This feature helps you customize common success and failure response formats on the server side and keep response logic consistent across the application.

## Common HTTP Response

In Koa applications, handlers usually run some logic and finally return a result. The result may be a success response or a failure response.

A common approach is to add helper methods to `ctx` and call them after preparing the data.

```typescript
import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    try {
      // ...
      return this.ctx.ok(/*...*/);
    } catch (err) {
      return this.ctx.fail(/*...*/);
    }
  }
}
```

Some applications also handle successful responses in Web middleware and failures in error filters.

Midway provides a unified response solution for this kind of code, so the response format is easier to maintain.

The most common case is returning JSON data.

Create an `HttpServerResponse` instance and call `json()` at the end of the chain.

```typescript
import { Controller, Get, Inject, HttpServerResponse } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/success')
  async home() {
    return new HttpServerResponse(this.ctx).success().json({
      // ...
    });
  }

  @Get('/fail')
  async home2() {
    return new HttpServerResponse(this.ctx).fail().json({
      // ...
    });
  }
}
```

By default, `HttpServerResponse` wraps JSON responses with a common success or failure structure.

A successful response looks like this:

```json
{
  "success": "true",
  "data": {}
}
```

A failed response looks like this:

```typescript
{
  success: 'false',
  message: //...
}
```

The `json()` method sets the response data and must be the last method in the chain.

### Common Response Formats

`HttpServerResponse` requires the current request context `ctx` when it is created.

```typescript
const serverResponse = new HttpServerResponse(this.ctx);
```

Then you can call response methods in a chain.

```typescript
// json
serverResponse.json({
  a: 1,
});
// text
serverResponse.text('abcde');
// blob
serverResponse.blob(Buffer.from('hello world'));
```

You can also combine data methods with status and header helpers.

```typescript
// status
serverResponse.status(200).text('abcde');
// header
serverResponse.header('Content-Type', 'text/html').text('<div>hello</div>');
// headers
serverResponse.headers({
  'Content-Type': 'text/plain',
  'Content-Length': '100'
}).text('a'.repeat(100));
```

### Response Templates

Midway provides templates for different data-setting methods so you can customize the returned structure.

For example, the default `json()` template looks like this:

```typescript
class ServerResponse {
  // ...
  static JSON_TPL = (data: Record<any, any>, isSuccess: boolean): unknown => {
    if (isSuccess) {
      return {
        success: 'true',
        data,
      };
    } else {
      return {
        success: 'false',
        message: data || 'fail',
      };
    }
  };
}
```

You can override the global template.

```typescript
HttpServerResponse.JSON_TPL = (data, isSuccess) => {
  if (isSuccess) {
    // ...
  } else {
    // ...
  }
};
```

You can also extend `HttpServerResponse` and override templates on a custom response class without changing the global default.

```typescript
class CustomServerResponse extends HttpServerResponse {}
CustomServerResponse.JSON_TPL = (data, isSuccess) => {
  if (isSuccess) {
    // ...
  } else {
    // ...
  }
};
```

Use the custom response class when creating the response.

```typescript
// ...

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    return new CustomServerResponse(this.ctx).success().json({
      // ...
    });
  }
}
```

The `text` and `blob` templates can be overridden in the same way.

```typescript
HttpServerResponse.TEXT_TPL = (data, isSuccess) => { /*...*/};
HttpServerResponse.BLOB_TPL = (data, isSuccess) => { /*...*/};
```

### Streaming Data Response

Use the built-in `stream()` method on `HttpServerResponse` to return streaming data.

```typescript
import { Controller, Get, Inject, sleep, HttpServerResponse } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    const res = new HttpServerResponse(this.ctx).stream();
    setTimeout(() => {
      for (let i = 0; i < 100; i++) {
        await sleep(100);
        res.send('abc'.repeat(100));
      }

      res.end();
    }, 1000);
    return res;
  }
}
```

You can use `STREAM_TPL` to customize the returned data structure.

```typescript
HttpServerResponse.STREAM_TPL = (data) => { /*...*/};
```

This template only handles successful data.

### File Streaming Response

Since v3.17.0, `HttpServerResponse` can also handle file downloads.

Pass a file path to return the file. The default response content type is `application/octet-stream`.

```typescript
import { Controller, Get, Inject, sleep, HttpServerResponse } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    const filePath = join(__dirname, '../../package.json');
    return new HttpServerResponse(this.ctx).file(filePath);
  }
}
```

To return a different content type, pass the type as the second argument.

```typescript
import { Controller, Get, Inject, sleep, HttpServerResponse } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    const filePath = join(__dirname, '../../package.json');
    return new HttpServerResponse(this.ctx).file(filePath, 'application/json');
  }
}
```

You can use `FILE_TPL` to customize the returned structure.

```typescript
HttpServerResponse.FILE_TPL = (data: Readable, isSuccess: boolean) => { /*...*/};
```

### SSE Response

Since v3.17.0, Midway provides built-in SSE (Server-Sent Events) support.

SSE messages use the following shape:

```typescript
export interface ServerSendEventMessage {
  data?: string | object;
  event?: string;
  id?: string;
  retry?: number;
}
```

Create an SSE response through `HttpServerResponse`.

```typescript
import { Controller, Get, Inject, sleep, HttpServerResponse } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    const res = new HttpServerResponse(this.ctx).sse();
    // ...
    return res;
  }
}
```

Use `send` and `sendEnd` to send data.

```typescript
const res = new HttpServerResponse(this.ctx).sse();

res.send({
  data: 'abcde'
});

res.sendEnd({
  data: 'end'
});
```

After `sendEnd` is called, the request will be closed.

You can also use `sendError` to send an error event.

```typescript
const res = new HttpServerResponse(this.ctx).sse();

res.sendError(new Error('test error'));
```

### Forward AI SDK SSE Responses

In AI gateway scenarios, the server often handles authentication, keeps system prompts private, assembles tool parameters, and forwards streaming results from OpenAI, Anthropic, or other SDKs to the frontend.

The object returned by `sse()` provides a `forward()` method. It converts an SDK `AsyncIterable` stream into an SSE response that frontend clients can parse.

The built-in provider-compatible protocols currently support the OpenAI and Anthropic SDK formats. Other SDKs can use the generic `eventsource` protocol or convert chunks to a custom event shape with `transform`.

Install the SDKs:

```bash
npm i openai @anthropic-ai/sdk
```

You can also declare the dependencies in `package.json`:

```json
{
  "dependencies": {
    "openai": "^6.35.0",
    "@anthropic-ai/sdk": "^0.92.0"
  }
}
```

OpenAI example:

```typescript
import { Controller, Get, Inject, HttpServerResponse } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/openai')
  async openai() {
    const upstream = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Replace with the model you want to use
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: 'Please introduce Midway.',
        },
      ],
      stream: true,
    });

    const res = new HttpServerResponse(this.ctx).sse();
    res.forward(upstream, {
      protocol: 'openai',
    });

    return res;
  }
}
```

`protocol: 'openai'` outputs OpenAI-client-compatible SSE frames and sends `data: [DONE]` when the upstream stream completes normally.

Anthropic example:

```typescript
import { Controller, Get, Inject, HttpServerResponse } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/anthropic')
  async anthropic() {
    const upstream = client.messages.stream({
      model: 'claude-sonnet-4-5', // Replace with the model you want to use
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: 'Please introduce Midway.',
        },
      ],
      thinking: {
        type: 'enabled',
        budget_tokens: 1024,
      },
    });

    const res = new HttpServerResponse(this.ctx).sse();
    res.forward(upstream, {
      protocol: 'anthropic',
    });

    return res;
  }
}
```

`protocol: 'anthropic'` preserves Anthropic event names such as `message_start`, `content_block_delta`, and `message_stop`, so the frontend can continue parsing events with Anthropic's event format.

If you only need browser `EventSource` or a custom frontend parser, use the default `eventsource` protocol.

```typescript
const res = new HttpServerResponse(this.ctx).sse();

res.forward(upstream, {
  protocol: 'eventsource',
});

return res;
```

`forward()` also supports lightweight event processing. Return `null` to skip the current event.

```typescript
const res = new HttpServerResponse(this.ctx).sse();

res.forward(upstream, {
  protocol: 'anthropic',
  transform: chunk => {
    if (chunk.type === 'ping') {
      return null;
    }
    return chunk;
  },
});

return res;
```

If the upstream SDK call uses an `AbortController`, pass it to `forward()`. When the client disconnects, Midway calls `abort()` to stop the upstream request.

```typescript
const abortController = new AbortController();
const upstream = await client.chat.completions.create({
  model: 'gpt-4o-mini', // Replace with the model you want to use
  messages,
  stream: true,
}, {
  signal: abortController.signal,
});

const res = new HttpServerResponse(this.ctx).sse();
res.forward(upstream, {
  protocol: 'openai',
  abortController,
});

return res;
```

:::info
`forward()` only converts SDK streaming events into protocol-compatible SSE responses. It does not parse or rewrite model `thinking`, `reasoning`, tool calls, or similar content. If the frontend needs to display that information, parse it on the frontend according to the OpenAI or Anthropic event format.
:::

You can use `SSE_TPL` to customize the returned structure.

```typescript
import { ServerSendEventMessage } from '@midwayjs/core';

HttpServerResponse.SSE_TPL = (data: ServerSendEventMessage) => { /*...*/};
```

This template only handles successful data. It does not handle `sendError`, and the returned value must still use the `ServerSendEventMessage` shape.

## Base Data Response

Besides HTTP scenarios, Midway also provides a base `ServerResponse` class for other scenarios.

`ServerResponse` includes `json`, `text`, and `blob` response methods, plus `success` and `fail` state methods.

Its behavior is consistent with `HttpServerResponse`.

By extending and overriding response templates, you can handle response values very simply.

For example, you can distinguish response formats for different users.

```typescript
// src/response/api.ts
export class UserServerResponse extends HttpServerResponse {}
UserServerResponse.JSON_TPL = (data, isSuccess) => {
  if (isSuccess) {
    return {
      status: 200,
      ...data,
    };
  } else {
    return {
      status: 500,
      message: 'limit exceed'
    };
  }
};

export class AdminServerResponse extends HttpServerResponse {}
AdminServerResponse.JSON_TPL = (data, isSuccess) => {
  if (isSuccess) {
    return {
      status: 200,
      router: data.router,
      ...data
    };
  } else {
    return {
      status: 500,
      message: 'interal error',
      ...data
    };
  }
};
```

Use the response classes like this:

```typescript
import { Controller, Get, Inject, sleep, HttpServerResponse } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserServerResponse, AdminServerResponse } from '../response/api';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    // ...
    if (this.ctx.user === 'xxx') {
      return new AdminServerResponse(this.ctx).json({
        router: '/',
        dbInfo: {
          // ...
        },
        userInfo: {
          role: 'admin',
        },
        status: 'ok',
      });
    }
    return new UserServerResponse(this.ctx).json({
      status: 'ok',
    });
  }
}
```
