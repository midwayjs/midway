# WebSocket

[ws](https://www.npmjs.com/package/ws) 模块是 Node 端的一个 WebSocket 协议的实现，该协议允许客户端(一般是浏览器)持久化和服务端的连接.
这种可以持续连接的特性使得 WebScoket 特别适合用于适合用于游戏或者聊天室等使用场景。

Midway 提供了对 [ws](https://www.npmjs.com/package/ws) 模块的支持和封装，能够简单的创建一个 WebSocket 服务。



相关信息：

| 描述                 |      |
| -------------------- | ---- |
| 可作为主框架独立使用 | ✅    |
| 包含自定义日志       | ❌    |
| 可独立添加中间件     | ✅    |




## 安装依赖


在现有项目中安装 WebSocket 的依赖。
```bash
$ npm i @midwayjs/ws --save
$ npm i @types/ws --save-dev
```


## 目录结构


下面是 WebSocket 项目的基础目录结构，和传统应用类似，我们创建了 `socket` 目录，用户存放 WebSocket 业务的服务代码。
```
.
├── package.json
├── src
│   ├── configuration.ts          ## 入口配置文件
│   ├── interface.ts
│   └── socket                  	## ws 服务的文件
│       └── hello.ts
├── test
├── bootstrap.js                  ## 服务启动入口
└── tsconfig.json
```
## 提供 Socket 服务


Midway 通过 `@WSController` 装饰器定义 WebSocket 服务。
```typescript
@Provide()
@WSController()
export class HelloSocketController {
}
```
当有客户端连接时，会触发 `connection` 事件，我们在代码中可以使用 `@OnWSConnection()` 装饰器来修饰一个方法，当每个客户端第一次连接服务时，将自动调用该方法。
```typescript
import { WSController, Provide, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';
import * as http from 'http';

@Provide()
@WSController()
export class HelloSocketController {

  @Inject()
  ctx: Context;

  @OnWSConnection()
  async onConnectionMethod(socket: Context, request: http.IncomingMessage) {
    console.log(`namespace / got a connection ${this.ctx.readyState}`);
  }
}

```


:::info
这里的 ctx 等价于 WebSocket 实例。
:::


## 消息和响应


WebSocket 是通过事件的监听方式来获取数据。Midway 提供了 `@OnWSMessage()` 装饰器来格式化接收到的事件，每次客户端发送事件，被修饰的方法都将被执行。
```typescript
import { WSController, Provide, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';

@Provide()
@WSController()
export class HelloSocketController {

  @Inject()
  ctx: Context;

  @OnWSMessage('message')
  async gotMessage(data) {
    return { name: 'harry', result: parseInt(data) + 5 };
  }
}

```


我们可以通过 `@WSBroadCast` 装饰器将消息发送到所有连接的客户端上。
```typescript
import { WSController, Provide, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';

@Provide()
@WSController()
export class HelloSocketController {

  @Inject()
  ctx: Context;
  
  @OnWSMessage('message')
  @WSBroadCast()
  async gotMyMessage(data) {
    return { name: 'harry', result: parseInt(data) + 5 };
  }

  @OnWSDisConnection()
  async disconnect(id: number) {
    console.log('disconnect ' + id);
  }
}

```
通过 `@OnWSDisConnection` 装饰器，在客户端断连时，做一些额外处理。


## 本地测试


和传统 web 的 midway 测试方法一样，我们使用 `createApp` 创建我们的服务端，唯一不同的是，我们要启动一个 WebSocket 服务，比如传递一个端口。
```typescript
import { createApp } from '@midwayjs/mock'
import { Framework } from '@midwayjs/ws';

describe('/test/index.test.ts', () => {	
  
	it('should test create webSocket app', async () => {
    const app = await createApp<Framework>(process.cwd(), { port: 3000});
    
    //...
    
    await closeApp(app);
  });
  
});
```
你可以直接使用 `ws` 来测试。也可以使用 Midway 提供的基于 `ws`  模块封装的测试客户端。


比如：
```typescript
import { createApp, closeApp, createWebSocketClient } from '@midwayjs/mock';

/ ... 省略 describe

it('should test create websocket app', async () => {

  // 创建一个服务
  const app = await createApp<Framework>(process.cwd(), { port: 3000});

  // 创建一个客户端
  const client = await createWebSocketClient(`ws://localhost:3000`);

  const result = await new Promise(resolve => {

    client.on('message', (data) => {
      // xxxx
      resolve(data);
    });

    // 发送事件
    client.send(1);

  });

  // 判断结果
  expect(JSON.parse(result)).toEqual({
    name: 'harry',
    result: 6,
  });

  await sleep(1000);

  // 关闭客户端
  await client.close();

  // 关闭服务端
  await closeApp(app);
  
});
```


使用 node 自带的 `events` 模块的 `once` 方法来优化，就会变成下面的代码。
```typescript
import { sleep } from '@midwayjs/decorator';
import { once } from 'events';
import { createApp, closeApp, createWebSocketClient } from '@midwayjs/mock';

// ... 省略 describe

it('should test create websocket app', async () => {
  
  // 创建一个服务
  const app = await createApp<Framework>(process.cwd(), { port: 3000});
  
  // 创建一个客户端
  const client = await createWebSocketClient(`ws://localhost:3000`);

  // 发送事件
  client.send(1);
  
  // 用事件的 promise 写法监听
  let gotEvent = once(client, 'message');
  // 等待返回
  let [data] = await gotEvent;
  
  // 判断结果
  expect(JSON.parse(data)).toEqual({
    name: 'harry',
    result: 6,
  });

  await sleep(1000);
  
  // 关闭客户端
  await client.close();
  
  // 关闭服务端
  await closeApp(app);
});

```
两种写法效果相同，按自己理解的写就行。


## 启动服务


ws 框架可以独立启动（依附于默认的 http 服务，也可以和其他 midway  框架一起启动）。通过编写 `bootstrap.js` 即可。


和其他框架类似，示例如下：
```typescript
// bootstrap.js
const WebSocketFramework = require('@midwayjs/ws').Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

// 初始化 socket.io 框架
const webSocketFramework = new WebSocketFramework().configure({
  port: 3000
});

Bootstrap
  .load(webSocketFramework)
  .run();
```
我们在本地开发时可以直接使用这个文件进行开发，我们的脚手架示例已经将其添加到 `npm run dev` 命令中。


而在线上部署时，也可以使用 `npm run start` 命令。

```json
"scripts": {
  "start": "NODE_ENV=production node ./bootstrap.js",
  "dev": "cross-env NODE_ENV=local midway-bin dev --ts --entryFile=bootstrap.js",
  "test": "midway-bin test --ts",
  "cov": "midway-bin cov --ts",
  ...
},
```


## 框架选项


`@midwayjs/ws` 作为框架启动时，可以传递的参数如下：

| port | number | 可选，如果传递了该端口，ws 内部会创建一个该端口的 HTTP 服务。

如果希望和 midway 其他的 web 框架配合使用，请不要传递该参数。 |
| --- | --- | --- |
| server | httpServer | 可选，当传递 port 时，可以指定一个已经存在的 webServer |

更多的启动选项，请参考 [ws 文档](https://github.com/websockets/ws)。


## 接入已有的 HTTP 服务


`@midwayjs/ws` 默认支持和 `@midwayjs/web` ， `@midwayjs/koa` ， `@midwayjs/express` 的多框架部署。


当多个框架部署时，请把 HTTP 类型的框架作为主框架，ws 将作为副框架加载，同时会自动找到当前的 HTTP 服务接入。


示例如下：
```typescript
// bootstrap.js

const WebFramework = require('@midwayjs/koa').Framework;
const SocketFramework = require('@midwayjs/ws').Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

// 加载主 web 框架
const webFramework = new WebFramework().configure({
  port: 7001
});

// 加载副 ws 框架，自动适配主框架，这里不需要配置 port
const socketFramework = new SocketFramework().configure({});

Bootstrap
  .load(webFramework)
  .load(socketFramework)
  .run();
```