# WebSocket

The [ws](https://www.npmjs.com/package/ws) module is an implementation of a WebSocket protocol on the Node side, which allows the client (usually the browser) to persist and connect to the server side.
This feature of continuous connection makes WebSocket particularly suitable for use in scenarios such as games or chat rooms.

Midway provides support and encapsulation of [ws](https://www.npmjs.com/package/ws) module, which can simply create a WebSocket service.

Related information:

**Provide services**

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ❌ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



## Installation dependency


Install WebSocket dependencies in existing projects.
```bash
$ npm i @midwayjs/ws@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/ws": "^3.0.0",
    // ...
  }
}
```

## Open the component

`@midwayjs/ws` can be used as an independent main framework.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as ws from '@midwayjs/ws';

@Configuration({
  imports: [ws]
  // ...
})
export class MainConfiguration {
  async onReady() {
		// ...
  }
}

```

It can also be attached to other main frameworks, such as `@midwayjs/koa`.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as ws from '@midwayjs/ws';

@Configuration({
  imports: [koa, ws]
  // ...
})
export class MainConfiguration {
  async onReady() {
		// ...
  }
}

```



## Directory structure


The following is the basic directory structure of WebSocket project. Similar to traditional applications, we have created a `socket` directory to store service codes for WebSocket services.
```
.
├── package.json
├── src
│   ├── configuration.ts          ## entry configuration file
│   ├── interface.ts
│   └── socket                    ## ws service file
│       └── hello.controller.ts
├── test
├── bootstrap.js                  ## service startup portal
└── tsconfig.json
```


## Socket service


Midway defines WebSocket services through the `@WSController` decorator.
```typescript
import { WSController } from '@midwayjs/core';

@WSController()
export class HelloSocketController {
  // ...
}
```
When there is a client connection, `connection` event will be triggered. We can use the `@OnWSConnection()` decorator in the code to decorate a method. When each client connects to the service for the first time, the method will be automatically called.
```typescript
import { WSController, OnWSConnection, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/ws';
import * as http from 'http';

@WSController()
export class HelloSocketController {

  @Inject()
  ctx: Context;

  @OnWSConnection()
  async onConnectionMethod(socket: Context, request: http.IncomingMessage) {
    console.log('namespace / got a connection ${this.ctx.readyState}');
  }
}

```


:::info
The ctx here is equivalent to the WebSocket instance.
:::


## Messages and responses


The WebSocket is to obtain data by monitoring events. Midway provides a `@OnWSMessage()` decorator to format the received event. Every time the client sends an event, the modified method will be executed.
```typescript
import { WSController, OnWSMessage, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/ws';

@WSController()
export class HelloSocketController {

  @Inject()
  ctx: Context;

  @OnWSMessage('message')
  async gotMessage(data) {
    return { name: 'harry', result: parseInt(data) +5 };
  }
}

```


We can send messages to all connected clients through the `@WSBroadCast` decorator.
```typescript
import { WSController, OnWSConnection, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/ws';

@WSController()
export class HelloSocketController {

  @Inject()
  ctx: Context;

  @OnWSMessage('message')
  @WSBroadCast()
  async gotMyMessage(data) {
    return { name: 'harry', result: parseInt(data) +5 };
  }

  @OnWSDisConnection()
  async disconnect(id: number) {
    console.log('disconnect '+ id);
  }
}

```
With the `@OnWSDisConnection` decorator, do some extra processing when the client is disconnected.



## WebSocket Server instance

The App provided by this component is the WebSocket Server instance itself, which can be obtained as follows.

```typescript
import { Controller, App } from '@midwayjs/core';
import { Application } from '@midwayjs/ws';

@Controller()
export class HomeController {

  @App('webSocket')
  wsApp: Application;
}
```

For example, we can broadcast messages in other Controller or Service.

```typescript
import { Controller, App } from '@midwayjs/core';
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



## Heartbeat check

Sometimes the connection between the server and the client may be interrupted, and neither the server nor the client is aware of the disconnection.

Heartbeat check proactive disconnect requests can be configured by enabling `enableServerHeartbeatCheck`.

```typescript
// src/config/config.default
export default {
   // ...
   webSocket: {
     enableServerHeartbeatCheck: true,
   },
}
```

The default check time is `30*1000` milliseconds, which can be modified through `serverHeartbeatInterval`, and the configuration unit is milliseconds.

```typescript
// src/config/config.default
export default {
   // ...
   webSocket: {
     serverHeartbeatInterval: 30000,
   },
}
```

This configuration will automatically send `ping` packets at regular intervals. If the client does not return a message in the next time interval, it will be automatically `terminate`.

If the client wants to know the status of the server, it can do so by listening to the `ping` message.

```typescript
import WebSocket from 'ws';

function heartbeat() {
   clearTimeout(this.pingTimeout);

   // After each ping is received, delay and wait. If the server ping message is not received next time, it is considered that there is a problem.
   this.pingTimeout = setTimeout(() => {
     //Reconnect or abort
   }, 30000 + 1000);
}

const client = new WebSocket('wss://websocket-echo.com/');

// ...
client.on('ping', heartbeat);
```

## Authentication

Before establishing a WebSocket connection, you may need to authenticate the client. Midway provides the `onWebSocketUpgrade` method to perform authentication before the WebSocket handshake since v3.20.9.

### Setting up Authentication Handler

You can set up an authentication handler when the application starts:

```typescript
import { Configuration, Inject } from '@midwayjs/core';
import { Framework } from '@midwayjs/ws';

@Configuration()
export class WSConfiguration {
  @Inject()
  wsFramework: Framework;

  async onReady() {
    // Set up pre-upgrade authentication handler
    this.wsFramework.onWebSocketUpgrade(async (request, socket, head) => {
      // Get token from URL parameters
      const url = new URL(request.url, `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      
      // Validate token
      if (token === 'valid-token') {
        return true; // Allow connection
      }
      
      return false; // Reject connection
    });
  }
}
```

### Authentication Handler Parameters

The authentication handler receives three parameters:

- `request`: HTTP request object (`http.IncomingMessage`)
- `socket`: Raw socket object
- `head`: WebSocket handshake header data (`Buffer`)

The handler should return a `Promise<boolean>`:
- `true`: Allow WebSocket connection
- `false`: Reject WebSocket connection

### Getting Authentication Information

You can get authentication information from multiple sources:

**URL Parameters**

```typescript
this.wsFramework.onWebSocketUpgrade(async (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const token = url.searchParams.get('token');
  const userId = url.searchParams.get('userId');
  
  // Validation logic
  return await this.validateToken(token, userId);
});
```

**Request Headers**

```typescript
this.wsFramework.onWebSocketUpgrade(async (request, socket, head) => {
  const authorization = request.headers.authorization;
  
  if (!authorization) {
    return false;
  }
  
  const token = authorization.replace('Bearer ', '');
  return await this.validateToken(token);
});
```

**Cookie**

```typescript
this.wsFramework.onWebSocketUpgrade(async (request, socket, head) => {
  const cookie = request.headers.cookie;
  
  if (!cookie) {
    return false;
  }
  
  // Parse cookie to get session information
  const sessionId = this.parseCookie(cookie).sessionId;
  return await this.validateSession(sessionId);
});
```

## Local test

### Configure test ports

Because the ws framework can be started independently (attached to the default http service, it can also be started with other midway frameworks).

When starting as a standalone framework, you need to specify a port.

```typescript
// src/config/config.default
export default {
  // ...
  webSocket: {
    port: 3000
  },
}
```

When starting as a sub-framework (for example, and HTTP, because HTTP does not specify a port during a single test (automatically generated using SuperTest), it cannot be tested well, and only one port can be explicitly specified in the Test environment.

```typescript
// src/config/config.unittest
export default {
  // ...
  koa: {
    port: null
  },
  webSocket
    port: 3000
  },
}
```

:::tip

- 1. The port here is only the port that the WebSocket service starts during testing.
- 2. The port in koa is null, which means that the http service will not be started without configuring the port in the test environment.

:::

### Test code

Like other Midway testing methods, we use `createApp` to start the project.

```typescript
import { createApp, close } from '@midwayjs/mock'
// The Framework definition used here is subject to the main framework.
import { Framework } from '@midwayjs/koa';

describe('/test/index.test.ts', () => {

  it('should create app and test webSocket', async () => {
    const app = await createApp<Framework>();

    //...

    await close(app);
  });

});
```


### Test client

You can use `ws` to test. You can also use the `ws` module-based test client provided by Midway.


For example:
```typescript
import { createApp, close, createWebSocketClient } from '@midwayjs/mock';
import { sleep } from '@midwayjs/core';

//... omit describe

it('should test create websocket app', async () => {

  // Create a service
  const app = await createApp<Framework>();

  // Create a client
  const client = await createWebSocketClient('ws://localhost:3000');

  const result = await new Promise(resolve => {

    client.on('message', (data) => {
      // xxxx
      resolve(data);
    });

    // Send event
    client.send(1);

  });

  // Judgment result
  expect(JSON.parse(result)).toEqual({
    name: 'harry',
    result: 6
  });

  await sleep(1000);

  // Close the client
  await client.close();

  // Close the server
  await close(app);

});
```


Use the `once` method of the `events` module that comes with node to optimize the code.
```typescript
import { sleep } from '@midwayjs/core';
import { once } from 'events';
import { createApp, close, createWebSocketClient } from '@midwayjs/mock';

//... omit describe

it('should test create websocket app', async () => {

  // Create a service
  const app = await createApp<Framework>(process.cwd());

  // Create a client
  const client = await createWebSocketClient('ws://localhost:3000');

  // Send event
  client.send(1);

  // Monitor with promise writing of events
  let gotEvent = once(client, 'message');
  // Waiting for return
  let [data] = await gotEvent;

  // Judgment result
  expect(JSON.parse(data)).toEqual({
    name: 'harry',
    result: 6
  });

  await sleep(1000);

  // Close the client
  await client.close();

  // Close the server
  await close(app);
});

```
The two writing methods have the same effect, just write as you understand.



## Configuration

## Default configuration

The configuration sample of `@midwayjs/ws` is as follows:

```typescript
// src/config/config.default
export default {
  // ...
  webSocket: {
    port: 7001
  },
}
```

When `@midwayjs/ws` and other `@midwayjs/web`, `@midwayjs/koa`, `@midwayjs/express` are enabled at the same time, ports can be reused.

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    port: 7001
  }
  webSocket: {
  	// No configuration here
  },
}
```



| Property | Type | Description |
| --- | --- | --- |
| port | number | Optionally, if the port is passed, ws will create an HTTP service for the port. If you want to work with other midway web frameworks, do not pass this parameter.  |
| server | httpServer | Optional, when passing port, you can specify an existing webServer |

For more information about startup options, see [ws documentation](https://github.com/websockets/ws).
