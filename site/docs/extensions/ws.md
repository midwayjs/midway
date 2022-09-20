# WebSocket

[ws](https://www.npmjs.com/package/ws) 模块是 Node 端的一个 WebSocket 协议的实现，该协议允许客户端(一般是浏览器)持久化和服务端的连接.
这种可以持续连接的特性使得 WebSocket 特别适合用于适合用于游戏或者聊天室等使用场景。

Midway 提供了对 [ws](https://www.npmjs.com/package/ws) 模块的支持和封装，能够简单的创建一个 WebSocket 服务。

相关信息：

**提供服务**

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |



## 安装依赖


在现有项目中安装 WebSocket 的依赖。
```bash
$ npm i @midwayjs/ws@3 --save
$ npm i @types/ws --save-dev
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/ws": "^3.0.0",
    // ...
  },
  "devDependencies": {
    "@types/ws": "^8.2.2",
    // ...
  }
}
```

## 开启组件

`@midwayjs/ws` 可以作为独立主框架使用。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as ws from '@midwayjs/ws';

@Configuration({
  imports: [ws],
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
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as ws from '@midwayjs/ws';

@Configuration({
  imports: [koa, ws],
  // ...
})
export class MainConfiguration {
  async onReady() {
		// ...
  }
}

```



## 目录结构


下面是 WebSocket 项目的基础目录结构，和传统应用类似，我们创建了 `socket` 目录，用户存放 WebSocket 业务的服务代码。
```
.
├── package.json
├── src
│   ├── configuration.ts          ## 入口配置文件
│   ├── interface.ts
│   └── socket                    ## ws 服务的文件
│       └── hello.controller.ts
├── test
├── bootstrap.js                  ## 服务启动入口
└── tsconfig.json
```


## 提供 Socket 服务


Midway 通过 `@WSController` 装饰器定义 WebSocket 服务。
```typescript
import { WSController } from '@midwayjs/decorator';

@WSController()
export class HelloSocketController {
  // ...
}
```
当有客户端连接时，会触发 `connection` 事件，我们在代码中可以使用 `@OnWSConnection()` 装饰器来修饰一个方法，当每个客户端第一次连接服务时，将自动调用该方法。
```typescript
import { WSController, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';
import * as http from 'http';

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
import { WSController, OnWSMessage, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';

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
import { WSController, OnWSConnection, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';

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



## WebSocket Server 实例

该组件提供的 App 即为 WebSocket Server 实例本身，我们可以如下获取。

```typescript
import { Controller, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/ws';

@Controller()
export class HomeController {

  @App('webSocket')
  wsApp: Application;
}
```

比如，我们可以在其他 Controller 或者 Service 中广播消息。

```typescript
import { Controller, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/ws';

@Controller()
export class HomeController {

  @App('webSocket')
  wsApp: Application;
  
  async invoke() {
    this.wsApp.clients.forEach(ws => {
      // ws.send('something');
    });
  }
}
```





## 本地测试

### 配置测试端口

由于 ws 框架可以独立启动（依附于默认的 http 服务，也可以和其他 midway  框架一起启动）。

当作为独立框架启动时，需要指定端口。

```typescript
// src/config/config.default
export default {
  // ...
  webSocket: {
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
  webSocket: {
    port: 3000,
  },
}
```

:::tip

- 1、这里的端口仅为 WebSocket 服务在测试时启动的端口
- 2、koa 中的端口为 null，即意味着在测试环境下，不配置端口，不会启动 http 服务

:::

### 测试代码

和其他 Midway 测试方法一样，我们使用 `createApp` 启动项目。

```typescript
import { createApp, close } from '@midwayjs/mock'
// 这里使用的 Framework 定义，以主框架为准
import { Framework } from '@midwayjs/koa';

describe('/test/index.test.ts', () => {

  it('should create app and test webSocket', async () => {
    const app = await createApp<Framework>();

    //...

    await close(app);
  });

});
```


### 测试客户端

你可以直接使用 `ws` 来测试。也可以使用 Midway 提供的基于 `ws`  模块封装的测试客户端。


比如：
```typescript
import { createApp, close, createWebSocketClient } from '@midwayjs/mock';
import { sleep } from '@midwayjs/decorator';

// ... 省略 describe

it('should test create websocket app', async () => {

  // 创建一个服务
  const app = await createApp<Framework>();

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
  await close(app);

});
```


使用 node 自带的 `events` 模块的 `once` 方法来优化，就会变成下面的代码。
```typescript
import { sleep } from '@midwayjs/decorator';
import { once } from 'events';
import { createApp, close, createWebSocketClient } from '@midwayjs/mock';

// ... 省略 describe

it('should test create websocket app', async () => {

  // 创建一个服务
  const app = await createApp<Framework>(process.cwd());

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
  await close(app);
});

```
两种写法效果相同，按自己理解的写就行。



## 配置

## 默认配置

`@midwayjs/ws` 的配置样例如下：

```typescript
// src/config/config.default
export default {
  // ...
  webSocket: {
    port: 7001,
  },
}
```

当 `@midwayjs/ws` 和其他 `@midwayjs/web` ， `@midwayjs/koa` ， `@midwayjs/express` 同时启用时，可以复用端口。

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    port: 7001,
  }
  webSocket: {
  	// 这里不配置即可
  },
}
```



| 属性   | 类型       | 描述                                                         |
| --- | --- | --- |
| port | number | 可选，如果传递了该端口，ws 内部会创建一个该端口的 HTTP 服务。如果希望和 midway 其他的 web 框架配合使用，请不要传递该参数。 |
| server | httpServer | 可选，当传递 port 时，可以指定一个已经存在的 webServer |

更多的启动选项，请参考 [ws 文档](https://github.com/websockets/ws)。
