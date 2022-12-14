# SocketIO

Socket.io 是一个业界常用库，可用于在浏览器和服务器之间进行实时，双向和基于事件的通信。

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01YTye6U22gICvarVur_!!6000000007149-2-tps-1204-352.png)


Midway 提供了对 Socket.io 的支持和封装，能够简单的创建一个 Socket.io 服务。本篇内容演示了如何在 Midway 体系下，提供 Socket.io 服务的方法。

Midway 当前采用了最新的 [Socket.io (v4.0.0)](https://socket.io/docs/v4) 进行开发。



相关信息：

**提供服务**

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ✅    |
| 包含独立日志      | ❌    |



## 安装依赖


在现有项目中安装 Socket.io 的依赖。

```bash
$ npm i @midwayjs/socketio@3 --save
## 客户端可选
$ npm i @types/socket.io-client socket.io-client --save-dev
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/socket.io": "^3.0.0",
    // 客户端可选
    "socket.io-client": "^4.4.1",
    // ...
  },
  "devDependencies": {
    // 客户端可选
    "@types/socket.io-client": "^1.4.36",
    // ...
  }
}
```



## 开启组件

`@midwayjs/socket.io` 可以作为独立主框架使用。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as socketio from '@midwayjs/socketio';

@Configuration({
  imports: [socketio],
  // ...
})
export class MainConfiguration {
  async onReady() {
		// ...
  }
}

```

也可以附加在其他的主框架下，比如 `@midwayjs/koa` 。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as socketio from '@midwayjs/socketio';

@Configuration({
  imports: [koa, socketio],
  // ...
})
export class MainConfiguration {
  async onReady() {
		// ...
  }
}


```




## 目录结构


下面是 Socket.io 项目的基础目录结构，和传统应用类似，我们创建了 `socket` 目录，用户存放 Soscket.io 业务的服务代码。
```
.
├── package.json
├── src
│   ├── configuration.ts          ## 入口配置文件
│   ├── interface.ts
│   └── socket                  	## socket.io 服务的文件
│       └── hello.controller.ts
├── test
├── bootstrap.js                  ## 服务启动入口
└── tsconfig.json
```


## Socket.io 工作原理


Socket.io 服务器和 Socket.io 客户端（浏览器，Node.js 或另一种编程语言）之间的双向通道通过 [WebSocket连接](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) 建立起来，在不可用时，将使用 HTTP 长轮询作为备用手段。


Socket.io 代码是基于 Engine.io 库搭建起来的，是属于 Engine.io 的上层实现。Engine.io 负责整个服务端和客户端连接的部分，包括连接检查，传输方式等等。而 Socket.io 负责上层的重连，封包缓冲，广播等等特性。


Socket.io（Engine.io）实现了两种 Transports（传输方式）。


第一种是 HTTP 长轮询。HTTP Get 请求用于 long-running（长连接），Post 请求用于 short-running（短连接）。


![image.png](https://img.alicdn.com/imgextra/i3/O1CN01xhdZHA1XTEpUue7CQ_!!6000000002924-2-tps-1778-1068.png)

第二种是 WebSocket 协议，直接基于 [WebSocket Connection](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 实现。它在服务器和客户端之间提供了双向且低延迟的通信通道。


在默认的情况下，Socket.io 会先采用 HTTP 长轮询进行连接，并发送一个类似下面结构的数据。
```typescript
{
  "sid": "FSDjX-WRwSA4zTZMALqx",			// 连接的 session id
  "upgrades": ["websocket"],					// 可升级的协议
  "pingInterval": 25000,							// 心跳时间间隔
  "pingTimeout": 20000								// 心跳超时时间
}
```

当当前的服务满足升级到 WebSocket 协议的要求时，会自动升级到 WebSocket 协议，如下图。
![image.png](https://img.alicdn.com/imgextra/i4/O1CN01QHZi9x1mz2ZLecco3_!!6000000005024-2-tps-585-216.png)

- 1、第一次握手，传输 sid 等结构
- 2、使用 HTTP 长轮询发送数据
- 3、使用 HTTP 长轮询返回数据
- 4、升级协议，使用 WebSocket 协议发送数据
- 5、当协议升级后，关闭之前的长轮询



之后就开始正常的 WebSocket 通信了。


## 提供 Socket 服务


Midway 通过 `@WSController` 装饰器定义 Socket 服务。
```typescript
@WSController('/')
export class HelloController {
  // ...
}
```
`@WSController` 的入参，指代了每个 Socket 的 Namespace（非 path）。如果不提供 Namespace，每个 Socket.io 会自动创建一个 `/` 的 Namespace，并且将客户端连接都归到其中。

:::info
这里的 namespace 支持字符串和正则。
:::


当 Namespace 有客户端连接时，会触发 `connection` 事件，我们在代码中可以使用 `@OnWSConnection()` 装饰器来修饰一个方法，当每个客户端第一次连接到该 Namespace 时，将自动调用该方法。
```typescript
import { WSController, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';

@WSController('/')
export class HelloSocketController {

  @Inject()
  ctx: Context;

  @OnWSConnection()
  async onConnectionMethod() {
    console.log('on client connect', this.ctx.id);
  }
}

```


:::info
这里的 ctx 等价于 socket 实例。
:::


## 消息和响应


Socket.io 是通过事件的监听方式来获取数据。Midway 提供了 `@OnWSMessage()` 装饰器来格式化接收到的事件，每次客户端发送事件，被修饰的方法都将被执行。
```typescript
import { WSController, Provide, OnWSMessage, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';

@WSController('/')
export class HelloSocketController {

  @Inject()
  ctx: Context;

  @OnWSMessage('myEvent')
  async gotMessage(data) {
    console.log('on data got', this.ctx.id, data);
  }
}

```
注意，由于 Socket.io 在一个事件中可以传递多个数据，这里的参数可以是多个。
```typescript
  @OnWSMessage('myEvent')
  async gotMessage(data1, data2, data3) {
    // ...
  }
```
当获取到数据之后，通过业务逻辑处理数据，然后将结果返回给客户端，返回的时候，我们也是通过另一个事件发送给客户端。


通过 `@WSEmit` 装饰器来将方法的返回值返回给客户端。
```typescript
import { WSController, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';

@WSController('/')
export class HelloSocketController {

  @Inject()
  ctx: Context;

  @OnWSMessage('myEvent')
  @WSEmit('myEventResult')
  async gotMessage() {
    return 'hello world';				// 这里将 hello world 字符串返回给客户端
  }
}
```
上面的代码，我们的方法返回值 hello world，将自动发送给客户端监听的 `myEventResult` 事件。



## Socket 中间件

Socket 中的中间件的写法和 [Web 中间件 ](../middleware)相似，但是加载的时机略有不同。

由于 Socket 有连接和接收消息两个阶段，所以中间件以此分为几类。

- 全局 Connection 中间件，会对所有 namespace 下的 connection 生效
- 全局 Message 中间件，会对所有 namespace 下的 message 生效
- Controller 中间件，会对单个 namespace 下的 connection 和 message 生效
- Connection 中间件，会对单个 namespace 下的 connection 生消息
- Message 中间件，会对单个 namespace 下的 message 生效

### 中间件写法

注意，中间件必须通过 `return` 返回结果。

```typescript
// src/middleware/socket.middleware.ts
import { Middleware } from '@midwayjs/decorator';
import { Context, NextFunction } from '@midwayjs/socketio';

@Middleware()
export class SocketMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // ...
      return await next();
    }
  }
}

```



### 全局中间件

和 Web 中间件类似，通过 `socket.io` 的 app 实例，注册中间件。

```typescript
import * as socketio from '@midwayjs/socketio';

@Configuration({
  imports: [
    socketio
  ],
  // ...
})
export class AutoConfiguration {

  @App('socketIO')
  app: Application;

  async onReady() {
    // 可以注册全局 connection 中间件
    this.app.useConnectionMiddleware(SocketMiddleware);
    // 也可以注册全局 Message 中间件
    this.app.useMiddleware(SocketMiddleware);
  }
}

```



### Namespace 中的中间件

通过装饰器，注册不同阶段的中间件。

比如 Namespace 级别的中间件，会对单个 namespace 下的 connection 和 message 生效。

```typescript
// ...

// Namespace 级别的中间件
@WSController('/api', { middleware: [SocketMiddleware]})
export class APIController {
}

```

Connection 中间件，在连接时生效。

```typescript
// ...

@WSController('/api')
export class APIController {
  
  // Connection 触发时的中间件
  @OnWSConnection({
    middleware: [SocketMiddleware]
  })
  init() {
    // ...
  }
}
```

Message 中间件，接收到特定消息时生效。

```typescript
// ...

@WSController('/api')
export class APIController {
  
  // Message 触发时的中间件
  @OnWSMessage('my', {
    middleware: [SocketMiddleware]
  })
  @WSEmit('ok')
  async gotMyMessage() {
    // ...
  }
}
```



## 本地测试

由于 socket.io 框架可以独立启动（依附于默认的 http 服务，也可以和其他 midway 框架一起启动）。

当作为独立框架启动时，需要指定端口。

```typescript
// src/config/config.default
export default {
  // ...
  socketIO: {
    port: 3000,
  },
}
```

当作为副框架启动时（比如和 http ，由于 http 在单测时未指定端口（使用 supertest 自动生成），无法很好的测试，可以仅在测试环境显式指定一个端口。

```typescript
// src/config/config.unittest
export default {
  // ...
  koa: {
    port: null,
  },
  socketIO: {
    port: 3000,
  },
}
```

:::tip

- 1、这里的端口仅为 WebSocket 服务在测试时启动的端口
- 2、koa 中的端口为 null，即意味着在测试环境下，不配置端口，不会启动 http 服务

:::


和其他 Midway 测试方法一样，我们使用 `createApp` 启动项目。


```typescript
import { createApp, close } from '@midwayjs/mock'
// 这里使用的 Framework 定义，以主框架为准
import { Framework } from '@midwayjs/koa';

describe('/test/index.test.ts', () => {
  it('should create app and test socket.io', async () => {
    const app = await createApp<Framework>();

    //...

    await close(app);
  });

});
```


你可以直接使用 `socket.io-client` 来测试。也可以使用 Midway 提供的基于 `socket.io-client`  模块封装的测试客户端。


假如我们的服务端处理逻辑如下（返回客户端传递的数据相加的结果）：
```typescript
@OnWSMessage('myEvent')
@WSEmit('myEventResult')
async gotMessage(data1, data2, data3) {
  return {
    name: 'harry',
  	result: data1 + data2 + data3,
  };
}
```


测试代码如下：
```typescript
import { createApp, close } from '@midwayjs/mock'
import { Framework } from '@midwayjs/koa';
import { createSocketIOClient } from '@midwayjs/mock';
import { once } from 'events';

describe('/test/index.test.ts', () => {
  it('should test create socket app', async () => {

    // 创建一个服务
    const app = await createApp<Framework>();

    // 创建一个对应的客户端
    const client = await createSocketIOClient({
      port: 3000,
    });

    // 拿到结果返回
    const data = await new Promise(resolve => {
      client.on('myEventResult', resolve);
      // 发送事件
      client.send('myEvent', 1, 2, 3);
    });

    // 判断结果
    expect(data).toEqual({
      name: 'harry',
      result: 6,
    });

    // 关闭客户端
    await client.close();
 		// 关闭服务端
    await close(app);
  });

});
```
如果多个客户端，也可以使用更简单的写法，使用 node 自带的 `events` 模块的 `once` 方法来优化，就会变成下面的代码。
```typescript
import { createApp, close } from '@midwayjs/mock'
import { Framework } from '@midwayjs/koa';
import { createSocketIOClient } from '@midwayjs/mock';
import { once } from 'events';

describe('/test/index.test.ts', () => {

  it('should test create socket app', async () => {

    // 创建一个服务
    const app = await createApp<Framework>();

    // 创建一个对应的客户端
    const client = await createSocketIOClient({
      port: 3000,
    });

    // 用事件的 promise 写法监听
    const gotEvent = once(client, 'myEventResult');
    // 发送事件
    client.send('myEvent', 1, 2, 3);
    // 等待返回
    const [data] = await gotEvent;
    // 判断结果
    expect(data).toEqual({
      name: 'harry',
      result: 6,
    });

    // 关闭客户端
    await client.close();
 		// 关闭服务端
    await close(app);
  });

});
```
两种写法效果相同，按自己理解的写就行。


## 等待回执（ack）的消息


Socket.io 支持一种直接返回消息的写法。当客户端传递消息的时候，如果最后一个参数为一个 function（callback），则服务端可以拿到这个 callback，将数据直接返回给客户端，不需要创建一个新的消息。


我们的服务代码不需要变化， `@midwayjs/socketio` 内部会判断最后一个参数，自动返回给客户端。


比如，服务端代码：
```typescript
@OnWSMessage('myEvent')
@WSEmit('myEventResult')
async gotMessage(data1, data2, data3) {
  return {
    name: 'harry',
  	result: data1 + data2 + data3,
  };
}
```
客户端测试代码：
```typescript
import { createApp, close } from '@midwayjs/mock'
import { Framework } from '@midwayjs/koa';
import { createSocketIOClient } from '@midwayjs/mock';
import { once } from 'events';

describe('/test/index.test.ts', () => {

  it('should test create socket app', async () => {

    // 创建一个服务
    const app = await createApp<Framework>();

    // 创建一个对应的客户端
    const client = await createSocketIOClient({
      port: 3000,
    });

    // 发送事件，这里使用了 await 的写法
    const data = await client.sendWithAck('myEvent', 1, 2, 3);

    // 判断结果
    expect(data).toEqual({
      name: 'harry',
      result: 6,
    });

    // 关闭客户端
    await client.close();
 		// 关闭服务端
    await close(app);
  });

});
```



## 常见的消息和广播


以下面的代码示例举例：


```typescript
import { Context, Application } from '@midwayjs/socketio';
import { WSController, OnWSMessage, WSEmit, App, Inject } from '@midwayjs/decorator';

@WSController('/')
export class HelloSocketController {

  @Inject()
  ctx: Context;

  @App()
  app: Application;

  @OnWSMessage('myEvent')
  @WSEmit('myEventResult')
  async gotMessage() {
    // TODO
  }
}
```


发送给客户端（也可以用装饰器形式直接 return）。
```typescript
this.ctx.emit("hello", "can you hear me?", 1, 2, "abc");
```
发送给的所有除发件人以外的所有客户端。
```typescript
this.ctx.broadcast.emit("broadcast", "hello friends!");
```
发送给所有在 `game`  房间的客户端（除了发送者）。
```typescript
this.ctx.to("game").emit("nice game", "let's play a game");
```
发送给所有的 `game1` 和 `game2` 房间的客户端（除了发送者）。
```typescript
this.ctx.to("game1").to("game2").emit("nice game", "let's play a game (too)");
```
发送给所有 `game` 房间的客户端，包括发送者。
```typescript
this.app.in("game").emit("big-announcement", "the game will start soon");
```
给 `myNamespace` 命名空间的客户端广播，包括发送者。
```typescript
// 从 app 发送
this.app.of("myNamespace").emit("bigger-announcement", "the tournament will start soon");
// 从 ctx 发送
this.ctx.nsp.emit("bigger-announcement", "the tournament will start soon");
```
发送到特定的 namespace 和 room，包括发送者。
```typescript
// 从 app 发送
this.app.of("myNamespace").to("room").emit("event", "message");
// 从 ctx 发送
this.ctx.nsp.emit("bigger-announcement", "the tournament will start soon");
```
发送给所有连接到当前节点上的客户端（多个节点的时候，就是多进程）
```typescript
this.app.local.emit("hi", "my lovely babies");
```

## Appliation（io 对象）


传统的 Socket.io 服务端创建代码如下：

```typescript
const io = require("socket.io")(3000);

io.on("connection", socket => {
  // ...
});
```

在 `@midwayjs/socketio` 框架中，Application 实例即为该 io 实例，类型和能力保持一致。即通过 `@App` 装饰器注入的 app 实例，即为 io 对象。


我们可以通过该对象做一些全局的事情。


比如获取所有的 socket 实例。

```typescript
// 返回所有的 socket 实例
const sockets = await app.fetchSockets();

// 返回所有的在 room1 的 socket 实例
const sockets = await app.in("room1").fetchSockets();

// 返回特定 socketId 的实例
const sockets = await app.in(theSocketId).fetchSockets();
```

多框架下，主框架一般为 Web 框架，我们可以通过指定 key 获取 Socket.io 的 app。

```typescript
import { Application as SocketApplication } from '@midwayjs/socketio';
import { Controller, App } from '@midwayjs/decorator';

@Controller()
export class UserController {

  @App('socketIO')
  socketApp: SocketApplication;
}
```


这样我们可以通过 `@midwayjs/socketio` 的 app 对象（等价于 io），调用现有的 socket 连接。


比如，HTTP 请求调用进来对特定 namespace 下的所有客户端广播：

```typescript
import { Application as SocketApplication } from '@midwayjs/socketio';
import { Provide, Controller, App, Get } from '@midwayjs/decorator';

@Controller()
export class UserController {

  @App('socketIO')
  socketApp: SocketApplication;

  @Get()
  async invoke() {
  	// 对 / 下的连接做广播
  	this.socketApp.of('/').emit('hi', 'everyone');
  }
}
```

更多的 io API，请参考 [Socket.io Server instance 文档](https://socket.io/docs/v4/server-instance/)。



## Socket 部署

### Socket 服务端口

`@midwayjs/socketio` 的配置样例如下：

```typescript
// src/config/config.default
export default {
  // ...
  socketIO: {
    port: 7001,
  },
}
```

当 `@midwayjs/socketio` 和其他 `@midwayjs/web` ， `@midwayjs/koa` ， `@midwayjs/express` 同时启用时，可以复用http 端口。

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    port: 7001,
  },
  socketIO: {
    // 这里不配置即可
  },
}
```



### Nginx 配置

一般来说，我们的 Node.js 服务前都会有 Nginx 等类似的反向代理服务，这里以 Nginx 的配置为例。

```nginx
http {
  server {
    listen 80;
    server_name example.com;

    location / {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://localhost:7001;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }
}
```



## 配置

### 可用配置

| 属性           | 类型   | 描述                                                         |
| --- | --- | --- |
| port | number | 可选，如果传递了该端口，socket.io 内部会创建一个该端口的 HTTP 服务，并将 socket 服务 attach 在其之上。如果希望和 midway 其他的 web 框架配合使用，请不要传递该参数。 |
| path | string | 可选，服务端 path |
| adapter | object | 分布式处理的适配器，比如可以配置 redis-adapter |
| connectTimeout | number | 客户端超时时间，单位 ms，默认值 _45000_ |

更多的启动选项，请参考 [Socket.io 文档](https://socket.io/docs/v4/server-api/#new-Server-httpServer-options)。



## 适配器

适配器是用于 Socket.io 在分布式部署时，在多台机器，多个进程能够进行通信的一层适配层，当前 socket.io 官方提供的适配器有几种：



- 1、cluster-adapter 用于在单台机器，多进程之间适配
- 2、redis-adapter 用于在多台机器，多个进程之间适配



在分布式场景下，我们一般使用 redis-adapater 来实现功能。




### 配置 redis 适配器

`@midwayjs/socketio` 提供了一个适配器（adapter）的入口配置，只需要初始化适配器实例，传入即可。

:::tip

Socket.io 官方已经更新了原有的适配器包名，现在的包名为 `@socket.io/redis-adapter`（原来叫 `socket.io-redis`)，配置有更新，迁移参考请查看 [官方文档](https://github.com/socketio/socket.io-redis-adapter#migrating-from-socketio-redis)。

:::

安装如下：

```bash
$ npm i @socket.io/redis-adapter --save
```



新版本配置的示例如下，更多的配置可以参考 [官方文档](https://github.com/socketio/socket.io-redis-adapter)：

```typescript
// src/config/config.default
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

// github 文档创建 redis 实例

const pubClient = new Redis(/* redis 配置 */);
const subClient = pubClient.duplicate();

export default {
  // ...
  socketIO: {
    adapter: createAdapter(pubClient, subClient)
  },
}
```

通过使用 `@socket.io/redis-adapter` 适配器运行 Socket.io，可以在不同的进程或服务器中运行多个 Socket.io 实例，这些实例都可以相互广播和发送事件。

此外，还有一些 Adapter 上的特殊 API，具体可以查看 [文档](https://github.com/socketio/socket.io-redis-adapter#api)。



## 粘性会话

由于 Node.js 经常在启动时使用多进程（cluster）模式，如果同一个会话（sid）无法多次访问到同一个进程上，socket.io 就会报错。

解决办法有两种。



### 使用 WebSocket 协议

最简单的方法，只启用 WebSocket 协议（禁用长轮询），这样就可以规避上述问题。

你需要在服务端和客户端同时配置。

```typescript
// 服务端
export default {
  // ...
  socketIO: {
    // ...
    transports: ['websocket'],
  },
}

// 客户端
const socket = io("http://127.0.0.1:7001", {
  transports: ['websocket']
});
```



### 调整进程模型

这是相对复杂的方法，但是在 pm2 部署的场景下，既要支持粘性会话又要启用轮询支持，这是唯一的解法。

第一步，禁用配置中启动的端口，比如：

```typescript
// src/config/config.default
export default {
  koa: {
    // port: 7001,
  },
  socketIO: {
    // ...
  },
};

```

如果开发需要，可以在 `config.local` 中加上端口，或者直接在 `package.json` 的 scripts 中加上端口。

```json
"scripts": {
  "dev": "cross-env NODE_ENV=local midway-bin dev --ts --port=7001",
},
```



第二步，调整你的 `bootstrap.js` 文件内容，使其变为下面的代码。

```typescript
const { Bootstrap, ClusterManager, setupStickyMaster } = require('@midwayjs/bootstrap');
const http = require('http');

// 创建一个进程管理器，处理子进程
const clusterManager = new ClusterManager({
  exec: __filename,
  count: 4,
  sticky: true, // 开启粘性会话支持
});

if (clusterManager.isPrimary()) {
  // 主进程启动一个 http server 做监听
  const httpServer = http.createServer();
  setupStickyMaster(httpServer);

  // 启动子进程
  clusterManager.start().then(() => {
    // 监听端口
    httpServer.listen(7001);
    console.log('main process is ok');
  });

  clusterManager.onStop(async () => {
    // 停止时关闭 http server
    await httpServer.close();
  });
} else {
  // 子进程逻辑
  Bootstrap
    .run()
    .then(() => {
      console.log('child is ready');
    });
}

```

在 pm2 启动时，无需指定 `-i` 参数来启动 worker，直接 `pm2 --name=xxx ./bootstrap.js` 使其只启动一个进程。




## 常见 API


### 获取连接数
```typescript
const count = app.engine.clientsCount;		// 获取所有的连接数
const count = app.of('/').sockets.size;		// 获取单个 namespace 里的连接数
```


### 修改 sid 生成
```typescript
const uuid = require("uuid");

app.engine.generateId = (req) => {
  return uuid.v4(); // must be unique across all Socket.IO servers
}
```



## 常见问题


### 服务端/客户端没连上，没响应


1、端口服务端和客户端一致


```typescript
export default {
  koa: {
    port: 7001,				 // 这里的端口
  }
}

// 或者

export default {
  socketIO: {
    port: 7001,				 // 这里的端口
  }
}
```


和下面的端口要一致。
```typescript
// socket.io client
const socket = io('************:7001', {
  //...
});

// midway 的 socket.io 测试客户端
const client = await createSocketIOClient({
  port: 7001
});
```

2、服务端的 path 和客户端的 path 要保持一致。path 指的是启动参数的部分。

```typescript
// config.default
export default {
  socketIO: {
    path: '/testPath'		// 这里是服务端 path
  }
}
```
和下面的 path 要一致

```typescript
// socket.io client
const socket = io('************:7001', {
  path: '/testPath'    // 这里是客户端的 path
});

// midway 的 socket.io 测试客户端
const client = await createSocketIOClient({
  path: '/testPath'
});
```



3、服务端的 namespace 和客户端的 namespace 要保持一致。

```typescript
// server
@WSController('/test')				// 这里是服务端的 namespace
export class HelloController {
}

// socket.io client
const io = require("socket.io-client")
io('*****:3000/test', {});			// 这里是客户端的 namespace


// midway 的 socket.io 测试客户端
const client = await createSocketIOClient({
  namespace: '/test',
});
```



### 配置 CORS


如果出现跨域错误，需要在启动的时候配置 cors 信息。
```typescript
// config.default
export default {
  socketIO: {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"]
    }
  }
}
```
具体参数可以参考 [Socket.io Handling CORS](https://socket.io/docs/v4/handling-cors/)。
