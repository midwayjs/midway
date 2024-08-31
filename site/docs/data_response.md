# 数据响应

从 v3.17.0 开始，框架添加了 `ServerResponse` 和 `HttpServerResponse` 的实现。

通过这个功能，可以定制服务端的响应成功和失败时的通用格式，规范整个返回逻辑。



## Http 通用响应

在 koa 场景下，一般都会处理一些逻辑，最后返回一个结果。在此过程中，会出现返回成功和失败的情况。

最为常见实现会在 `ctx` 增加一些方法，包括数据后返回。

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

也有人会在 Web 中间件中处理成功的返回，在错误过滤器中处理失败的返回。

为了解决这类代码难以统一维护的问题，框架提供了一套统一返回的方案。

我们以最为常见的返回 JSON 数据为例。

通过创建 `HttpServerResponse` 实例后，调用 `json()` 方法，链式返回数据。

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

默认情况下，`HttpServerResponse` 在成功和失败的场景上会提供 JSON 的通用包裹结构。

比如在成功的场景下，接收到的数据如下。

```json
{
  success: 'true',
  data: //...
}
```

而在失败的场景下，接收到的数据如下。

```typescript
{
  success: 'false',
  message: //...
}
```

注意，`json()` 方法是数据设置的方法，必须在最后一个调用。



### 常用的响应格式

`HttpServerResponse` 需要传递一个当前请求的上下文对象 `ctx` 才能实例化。

```typescript
const serverResponse = new HttpServerResponse(this.ctx);
```

之后以链式的形式进行调用。

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

除了设置数据的方法，还提供了一些其他的快捷方法可以组合使用。

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



### 响应模版

针对不同的设置数据的方法，框架提供了不同模版以供用户自定义。

比如 `json()` 方法的模版如下。

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

我们可以将全局的模版进行覆盖达到自定义的目的。

```typescript
HttpServerResponse.JSON_TPL = (data, isSuccess) => {
  if (isSuccess) {
    // ...
  } else {
    // ...
  }
};
```

也可以通过继承，自定义不同的响应模版，这样可以不影响全局的默认模板。

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

在使用时，创建实例即可。

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

此外，针对 `text` ，`blob` 方法的模版均可以覆盖。

```typescript
HttpServerResponse.TEXT_TPL = (data, isSuccess) => { /*...*/};
HttpServerResponse.BLOB_TPL = (data, isSuccess) => { /*...*/};
```



### 数据流式响应

使用内置的 `HttpServerResponse` 中的 `stream` 方法来处理流式数据返回。

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

通过 `STEAM_TPL` 可以修改数据的返回结构

```typescript
HttpServerResponse.STREAM_TPL = (data) => { /*...*/};
```

注意，这个模版只处理成功的数据。



### 文件流式响应

从 v3.17.0 开始，可以通过 `HttpServerResponse` 简单处理文件下载。

传递一个文件路径即可，默认会使用 `application/octet-stream` 响应头返回。

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

如需返回不同的类型，可以通过第二个参数指定类型。

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
    return new HttpServerResponse(this.ctx, 'application/json').file(filePath);
  }
}
```

通过 `FILE_TPL` 可以修改返回结构。

```typescript
HttpServerResponse.FILE_TPL = (data: Readable, isSuccess: boolean) => { /*...*/};
```



### SSE 响应

从 v3.17.0 开始，框架提供了内置的 SSE （Server-Sent Events）支持。

SSE 的数据定义如下，你需要按下面的格式返回。

```typescript
export interface ServerSendEventMessage {
  data?: string | object;
  event?: string;
  id?: string;
  retry?: number;
}
```

通过 `HttpServerResponse` 定义一个返回实例。

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

可以通过 `send` 和 `sendEnd` 进行数据传递。

```typescript
const res = new HttpServerResponse(this.ctx).sse();

res.send({
  data: 'abcde'
});

res.sendEnd({
  data: 'end'
});
```

调用 `sendEnd` 后，请求将被关闭。

也可以通过 `sendError` 发送错误。

```typescript
const res = new HttpServerResponse(this.ctx).sse();

res.sendError(new Error('test error'));
```

通过 `SSE_TPL` 可以修改返回结构。

```typescript
import { ServerSendEventMessage } from '@midwayjs/core';

HttpServerResponse.FILE_TPL = (data: ServerSendEventMessage) => { /*...*/};
```

注意，这个模版只处理成功的数据，不会处理 `sendError` 的情况，且返回也必须是 `ServerSendEventMessage` 格式。



## 基础数据响应

除了 Http 场景之外，框架提供了基础的 `ServerResponse` 类，用于其他的场景。

`ServerResponse` 包含 `json`，`text`，`blob` 三种数据返回方法，以及 `success` 和 `fail` 这两个设置状态的方法。

行为和 `HttpServerResponse` 一致。

通过继承、覆盖等行为，可以非常简单的处理响应值。

比如我们对不同的用户做返回区分。

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

使用返回。

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

