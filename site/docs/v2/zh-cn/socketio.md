---
title: SocketIO
---

Socket.io 是一个业界常用库，可用于在浏览器和服务器之间进行实时，双向和基于事件的通信。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1616508690266-37c60f43-99a5-4586-b96d-49fbe88a9db7.png#height=176&id=dC3sH&margin=%5Bobject%20Object%5D&name=image.png&originHeight=352&originWidth=1204&originalType=binary&ratio=1&size=26196&status=done&style=none&width=602" width="602" />

Midway 提供了对 Socket.io 的支持和封装，能够简单的创建一个 Socket.io 服务。本篇内容演示了如何在 Midway 体系下，提供 Socket.io 服务的方法。

Midway 当前采用了最新的 [Socket.io (v4.0.0)](https://socket.io/docs/v4) 进行开发。

## 创建示例

纯 socket.io 示例。

```bash
$ npm -v

# 如果是 npm v6
$ npm init midway --type=socketio my_midway_app

# 如果是 npm v7
$ npm init midway -- --type=socketio my_midway_app
```

或者在现有项目中安装 Socket.io 的依赖。

```bash
$ npm i @midwayjs/socketio --save
$ npm i @types/socket.io-client socket.io-client --save-dev
```

Egg.js + Socket.io 示例。

```bash
$ npm -v

# 如果是 npm v6
$ npm init midway --type=web-socketio my_midway_app

# 如果是 npm v7
$ npm init midway -- --type=web-socketio my_midway_app
```

## 目录结构

下面是 Socket.io 项目的基础目录结构，和传统应用类似，我们创建了 `socket`  目录，用户存放 Soscket.io 业务的服务代码。

```
.
├── package.json
├── src
│   ├── configuration.ts          ## 入口配置文件
│   ├── interface.ts
│   └── socket                  	## socket.io 服务的文件
│       └── hello.ts
├── test
├── bootstrap.js                  ## 服务启动入口
└── tsconfig.json
```

## Socket.io 工作原理

Socket.io 服务器和 Socket.io 客户端（浏览器，Node.js 或另一种编程语言）之间的双向通道通过 [WebSocket 连接](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) 建立起来，在不可用时，将使用 HTTP 长轮询作为备用手段。

Socket.io 代码是基于 Engine.io 库搭建起来的，是属于 Engine.io 的上层实现。Engine.io 负责整个服务端和客户端连接的部分，包括连接检查，传输方式等等。而 Socket.io 负责上层的重连，封包缓冲，广播等等特性。

Socket.io（Engine.io）实现了两种 Transports（传输方式）。

第一种是 HTTP 长轮询。HTTP Get 请求用于 long-running（长连接），Post 请求用于 short-running（短连接）。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1616509613529-24413e09-2173-4b68-94d2-f0c492e8a192.png#height=534&id=wNTnr&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1068&originWidth=1778&originalType=binary&ratio=1&size=97397&status=done&style=none&width=889" width="889" />

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

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1616510929886-2eed0b2e-0ca2-44e4-b471-a342e2a916b0.png#height=210&id=XUhOM&margin=%5Bobject%20Object%5D&name=image.png&originHeight=216&originWidth=585&originalType=binary&ratio=1&size=28233&status=done&style=none&width=568" width="568" />

- 1、第一次握手，传输 sid 等结构
- 2、使用 HTTP 长轮询发送数据
- 3、使用 HTTP 长轮询返回数据
- 4、升级协议，使用 WebSocket 协议发送数据
- 5、当协议升级后，关闭之前的长轮询

之后就开始正常的 WebSocket 通信了。

## 提供 Socket 服务

Midway 通过 `@WSController`  装饰器定义 Socket 服务。

```typescript
@Provide()
@WSController('/')
export class HelloController {}
```

`@WSController`  的入参，指代了每个 Socket 的 Namespace（非 path）。如果不提供 Namespace，每个 Socket.io 会自动创建一个 `/`  的 Namespace，并且将客户端连接都归到其中。

:::info
这里的 namespace 支持字符串和正则。
:::

当 Namespace 有客户端连接时，会触发 `connection`  事件，我们在代码中可以使用 `@OnWSConnection()`  装饰器来修饰一个方法，当每个客户端第一次连接到该 Namespace 时，将自动调用该方法。

```typescript
import { WSController, Provide, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';

@Provide()
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

Socket.io 是通过事件的监听方式来获取数据。Midway 提供了 `@OnWSMessage()`  装饰器来格式化接收到的事件，每次客户端发送事件，被修饰的方法都将被执行。

```typescript
import { WSController, Provide, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';

@Provide()
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

通过 `@WSEmit`  装饰器来将方法的返回值返回给客户端。

```typescript
import { WSController, Provide, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';

@Provide()
@WSController('/')
export class HelloSocketController {
  @Inject()
  ctx: Context;

  @OnWSMessage('myEvent')
  @WSEmit('myEventResult')
  async gotMessage() {
    return 'hello world'; // 这里将 hello world 字符串返回给客户端
  }
}
```

上面的代码，我们的方法返回值 hello world，将自动发送给客户端监听的 `myEventResult`  事件。

## 本地测试

和传统 web 的 midway 测试方法一样，我们使用 `createApp`  创建我们的服务端，唯一不同的是，我们要启动一个 Socket.io 服务，比如传递一个端口。

```typescript
import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/socketio';

describe('/test/index.test.ts', () => {
  it('should test create socket app', async () => {
    const app = await createApp<Framework>(process.cwd(), { port: 3000 });

    //...

    await close(app);
  });
});
```

你可以直接使用 `socket.io-client` 来测试。也可以使用 Midway 提供的基于 `socket.io-client` 模块封装的测试客户端。

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
import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/socketio';
import { createSocketIOClient } from '@midwayjs/mock';
import { once } from 'events';

describe('/test/index.test.ts', () => {
  it('should test create socket app', async () => {
    // 创建一个服务
    const app = await createApp<Framework>(process.cwd(), { port: 3000 });

    // 创建一个对应的客户端
    const client = await createSocketIOClient({
      port: 3000,
    });

    // 拿到结果返回
    const data = await new Promise((resolve) => {
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

如果多个客户端，也可以使用更简单的写法，使用 node 自带的 `events`  模块的 `once`  方法来优化，就会变成下面的代码。

```typescript
import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/socketio';
import { createSocketIOClient } from '@midwayjs/mock';
import { once } from 'events';

describe('/test/index.test.ts', () => {
  it('should test create socket app', async () => {
    // 创建一个服务
    const app = await createApp<Framework>(process.cwd(), { port: 3000 });

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

我们的服务代码不需要变化， `@midwayjs/socketio`  内部会判断最后一个参数，自动返回给客户端。

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
import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/socketio';
import { createSocketIOClient } from '@midwayjs/mock';
import { once } from 'events';

describe('/test/index.test.ts', () => {
  it('should test create socket app', async () => {
    // 创建一个服务
    const app = await createApp<Framework>(process.cwd(), { port: 3000 });

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

@Provide()
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
this.ctx.emit('hello', 'can you hear me?', 1, 2, 'abc');
```

发送给的所有除发件人以外的所有客户端。

```typescript
this.ctx.broadcast.emit('broadcast', 'hello friends!');
```

发送给所有在 `game`  房间的客户端（除了发送者）。

```typescript
this.ctx.to('game').emit('nice game', "let's play a game");
```

发送给所有的 `game1`  和 `game2`  房间的客户端（除了发送者）。

```typescript
this.ctx.to('game1').to('game2').emit('nice game', "let's play a game (too)");
```

发送给所有 `game`  房间的客户端，包括发送者。

```typescript
this.app.in('game').emit('big-announcement', 'the game will start soon');
```

给 `myNamespace`  命名空间的客户端广播，包括发送者。

```typescript
// 从 app 发送
this.app.of('myNamespace').emit('bigger-announcement', 'the tournament will start soon');
// 从 ctx 发送
this.ctx.nsp.emit('bigger-announcement', 'the tournament will start soon');
```

发送到特定的 namespace 和 room，包括发送者。

```typescript
// 从 app 发送
this.app.of('myNamespace').to('room').emit('event', 'message');
// 从 ctx 发送
this.ctx.nsp.emit('bigger-announcement', 'the tournament will start soon');
```

发送给所有连接到当前节点上的客户端（多个节点的时候，就是多进程）

```typescript
this.app.local.emit('hi', 'my lovely babies');
```

## 启动服务

Socket.io 框架可以独立启动（依附于默认的 http 服务，也可以和其他 midway 框架一起启动）。通过编写 `bootstrap.js`  即可。

和其他框架类似，示例如下：

```typescript
// bootstrap.js
const SocketFramework = require('@midwayjs/socketio').Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

// 初始化 socket.io 框架
const socketFramework = new SocketFramework().configure({
  port: 3000,
});

Bootstrap.load(socketFramework).run();
```

我们在本地开发时可以直接使用这个文件进行开发，我们的脚手架示例已经将其添加到 `npm run dev`  命令中。

而在线上部署时，也可以使用 `npm run start`  命令。

```json
"scripts": {
  "start": "NODE_ENV=production node ./bootstrap.js",
  "dev": "cross-env NODE_ENV=local midway-bin dev --ts --entryFile=bootstrap.js",
  "test": "midway-bin test --ts",
  "cov": "midway-bin cov --ts",
  ...
},
```

## 多进程

在多进程（pm2）场景下，我们需要注意两件事。

- 1、如果启用了 HTTP 长轮询（默认设置），则需要启用粘性会话（sticky session）
- 2、配置一个 redis 适配器

### 配置粘性会话

### 配置 redis 适配器

`@midwayjs/socketio`  提供了一个生成 redis 适配器的工具类，只需要传入 redis 的 host 和 port 即可。

示例如下：

```typescript
// bootstrap.js
const { Framework, createRedisAdapter } = require('@midwayjs/socketio');
const { Bootstrap } = require('@midwayjs/bootstrap');

// 初始化 socket.io 框架
const socketFramework = new Framework().configure({
  port: 3000,
  adapter: createRedisAdapter({ host: '127.0.0.1', port: 6379 }),
});

Bootstrap.load(socketFramework).run();
```

## 框架选项

`@midwayjs/socketio` 作为框架启动时，可以传递的参数如下：

| port | number | 可选，如果传递了该端口，socket.io 内部会创建一个该端口的 HTTP 服务，并将 socket 服务 attach 在其之上。

| 如果希望和 midway 其他的 web 框架配合使用，请不要传递该参数。 |
| ------------------------------------------------------------- | ------ | ---------------------------------------- |
| pubClient                                                     | object | 可选，当 ioredis 作为适配器时的参数      |
| subClient                                                     | object | 可选，当 ioredis 作为适配器时的参数      |
| path                                                          | string | 可选，服务端 path                        |
| adapter                                                       | object | socket.io-redis 适配器                   |
| connectTimeout                                                | number | 客户端超时时间，单位 ms，默认值  *45000* |

更多的启动选项，请参考 [Socket.io 文档](https://socket.io/docs/v4/server-api/#new-Server-httpServer-options)。

## 接入已有的 HTTP 服务

`@midwayjs/socketio`  默认支持和 `@midwayjs/web` ， `@midwayjs/koa` ， `@midwayjs/express`  的多框架部署。

当多个框架部署时，请把 HTTP 类型的框架作为主框架，Socket.io 将作为副框架加载，同时会自动找到当前的 HTTP 服务接入。

示例如下：

```typescript
// bootstrap.js

const WebFramework = require('@midwayjs/koa').Framework;
const SocketFramework = require('@midwayjs/socketio').Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

// 加载主 web 框架
const webFramework = new WebFramework().configure({
  port: 7001,
});

// 加载副 socket.io 框架，自动适配主框架，这里不需要配置 port
const socketFramework = new SocketFramework().configure({});

Bootstrap.load(webFramework).load(socketFramework).run();
```

## Appliation（io 对象）

传统的 Socket.io 服务端创建代码如下：

```typescript
const io = require('socket.io')(3000);

io.on('connection', (socket) => {
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
const sockets = await app.in('room1').fetchSockets();

// 返回特定 socketId 的实例
const sockets = await app.in(theSocketId).fetchSockets();
```

更多的 io API，请参考 [Socket.io Server instance 文档](https://socket.io/docs/v4/server-instance/)。

## 多框架场景

多框架下，主框架一般为 Web 框架，我们可以通过指定 key 获取 Socket.io 的 app。

```typescript
import { Application as SocketApplication } from '@midwayjs/socketio';
import { Provide, Controller, App, MidwayFrameworkType } from '@midwayjs/decorator';

@Provide()
@Controller()
export class UserController {
  @App(MidwayFrameworkType.WS_IO)
  socketApp: SocketApplication;
}
```

这样我们可以通过 `@midwayjs/socketio` 的 app 对象（等价于 io），调用现有的 socket 连接。

比如，HTTP 请求调用进来对特定 namespace 下的所有客户端广播：

```typescript
import { Application as SocketApplication } from '@midwayjs/socketio';
import { Provide, Controller, App, Get, MidwayFrameworkType } from '@midwayjs/decorator';

@Provide()
@Controller()
export class UserController {
  @App(MidwayFrameworkType.WS_IO)
  socketApp: SocketApplication;

  @Get()
  async invoke() {
    // 对 / 下的连接做广播
    this.socketApp.of('/').emit('hi', 'everyone');
  }
}
```

多框架场景下，测试和启动都有一定变化，请参考 [多框架研发](multi_framework_start#4r5Xm) 。

## 常见 API

### 获取连接数

```typescript
const count = app.engine.clientsCount;		// 获取所有的连接数
const count app.of('/').sockets.size;			// 获取单个 namespace 里的连接数
```

### 修改 sid 生成

```typescript
const uuid = require('uuid');

app.engine.generateId = (req) => {
  return uuid.v4(); // must be unique across all Socket.IO servers
};
```

## 常见问题

### 服务端/客户端没连上，没响应

1、端口服务端和客户端一致
​

```typescript
const { Framework } = require('@midwayjs/socketio');
const io = require('socket.io-client');

// server
const socketFramework = new Framework().configure({
  port: 7001, // 这里的端口
});
```

和下面的端口要一致。

```typescript
// client
const socket = io('************:7001', {
  //...
});

// midway 的测试客户端
const client = await createSocketIOClient({
  port: 7001,
});
```

2、服务端的 path 和客户端的 path 要保持一致。path 指的是启动参数的部分。

```typescript
// bootstrap.js

const { Framework } = require('@midwayjs/socketio');
const io = require('socket.io-client');

// server
const socketFramework = new Framework().configure({
  port: 7001,
  path: '/testPath', // 这里是服务端 path
});

// client
const socket = io('************:7001', {
  path: '/testPath', // 这里是客户端的 path
});

// midway 的测试客户端
const client = await createSocketIOClient({
  path: '/testPath',
});
```

3、服务端的 namespace 和客户端的 namespace 要保持一致。

```typescript
// server
@Provide()
@WSController('/test') // 这里是服务端的 namespace
export class HelloController {}

// client
const io = require('socket.io-client');
io('*****:3000/test', {}); // 这里是客户端的 namespace

// midway 的测试客户端
const client = await createSocketIOClient({
  namespace: '/test',
});
```

### 配置 CORS

如果出现跨域错误，需要在启动的时候配置 cors 信息。

```typescript
// bootstrap.js

const { Framework } = require('@midwayjs/socketio');
const socketFramework = new Framework().configure({
  port: 7001,
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
});
```

具体参数可以参考 [Socket.io Handling CORS](https://socket.io/docs/v4/handling-cors/)。
