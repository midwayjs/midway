# gRPC

GRPC is a high-performance, universal open source RPC framework, which is mainly developed by Google for mobile applications and designed based on HTTP/2 protocol standards. It is developed based on ProtoBuf(Protocol Buffers) serialization protocol and supports many development languages.


This article demonstrates how to provide gRPC services under Midway system and how to call gRPC services.


Midway uses the latest gRPC-recommended [@grpc/grpc-js](https://github.com/grpc/grpc-node/tree/master/packages/grpc-js) for development, and provides toolkits for quick service release and service call.

The module we use is `@midwayjs/grpc`, which can publish services independently and call gRPC services through other frameworks.

Related information:

**Provide services**

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ❌ |
| Can be used for integration | ✅ |

**Call Service**

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |

**Other**

| Description |      |
| -------------------- | ---- |
| Can be used independently as the main framework | ✅ |
| Middleware can be added independently | ✅ |



## Installation dependency

```bash
$ npm i @midwayjs/grpc@3 --save
$ npm i @midwayjs/grpc-helper --save-dev
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/grpc": "^3.0.0",
    // ...
  },
  "devDependencies": {
    "@midwayjs/grpc-helper": "^1.0.0 ",
    // ...
  }
}
```



## Open the component

:::tip

Whether it is providing a service or invoking a service, you need to open the component.

:::

`@midwayjs/grpc` can be used as an independent main framework.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as grpc from '@midwayjs/grpc';

@Configuration({
  imports: [grpc]
  // ...
})
export class MainConfiguration {
  async onReady() {
		// ...
  }
}

```

It can also be attached to other main frameworks, such as `@midwayjs/Koa`.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as grpc from '@midwayjs/grpc';

@Configuration({
  imports: [koa, grpc]
  // ...
})
export class MainConfiguration {
  async onReady() {
		// ...
  }
}

```



## Directory structure

The general directory structure is as follows. `src/provider` is the directory that provides gRPC services.

```
.
├── package.json
├── proto                         ## proto definition file
│   └── helloworld.proto
├── src
│   ├── configuration.ts          ## entry configuration file
│   ├── interface.ts
│   └── provider                  ## files provider services provided by gRPC
│       └── greeter.ts
├── test
├── bootstrap.js                  ## service startup portal
└── tsconfig.json
```



## Define service interface


In microservices, defining a service requires a specific interface definition language (IDL) to complete, and Protocol Buffers is used as serialization protocol by default in gRPC.


The serialization protocol is independent of the language and platform, and provides implementations in multiple languages, such as Java,C ++,Go, etc. Each implementation contains compilers and library files in the corresponding language. Therefore, gRPC is a service framework that provides and calls across languages.

The general architecture of a gRPC service can be represented by a diagram on the official website.

![](https://img.alicdn.com/imgextra/i3/O1CN01kpIyg51k8i5DtcGpZ_!!6000000004639-2-tps-621-445.png)


The default suffix is `.proto` for files that Protocol the Buffers protocol. IDL file with the. proto suffix, and generates language-specific data structures, server-side interfaces, and client-side Stub code through its compiler.


:::info
Because proto files can be used across languages, in order to facilitate sharing, we usually place proto files outside the src directory to facilitate other tools to copy and distribute.
:::


The following is a basic `proto/helloworld.proto` file.
```protobuf
syntax = "proto3";

package helloworld;

service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}

```


Proto3 represents the third version of the protobuf protocol, which is currently recommended by gRPC, "simple syntax and more complete functions".


We can define the service body in `service` format, which can include methods. At the same time, we can describe the specific request parameters and response parameters of the service in more detail through `message`.


For more information, see [Google's official website documentation](https://developers.google.com/protocol-buffers/docs/overview#simple).


:::info
As you will see, this is very similar to Class in Java, and each structure is equivalent to a class in Java.
:::


### Write proto file


Now let's look at the previous service again, is it easy to understand.
```protobuf
syntax = "proto3";

package helloworld;

// Definition of service
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// Service request parameters
message HelloRequest {
  string name = 1;
}

// Response parameters of the service
message HelloReply {
  string message = 1;
}

```


We define a service called `Greeter`, which contains a requestor of a `HelloRequest` structure and a respondent of a `HelloReply` structure.


Next, we will demonstrate this service to you.


### Generate code definitions


The traditional gRPC framework requires users to manually write proto files, generate js services, and finally rewrite and implement them according to the services generated by js. Under Midway system, we provide a grpc-helper toolkit to speed up this process.


If there is no installation, you can install it first.
```bash
$ npm i @midwayjs/grpc-helper --save-dev
```


The function of the grpc-helper tool is to generate the corresponding readable ts interface file from the proto file provided by the user.


We can add a script to facilitate this process.
```json
{
	"scripts": {
     "generate": "tsproto --path proto --output src/domain"
  }
}
```


Then `npm run generate` is executed.


After the preceding command is executed, the service interface definition corresponding to the Proto file is generated in the `src/domain` Directory of the code.


:::info
Whether it is providing gRPC service or calling gRPC service, it must be defined.
:::


The generated code is as follows, including a namespace (namespace) and two TypeScript Interface under the namespace, `Greeter` for writing server-side implementations and `GreeterClient` for writing client-side implementations.
```typescript
/**
* This file is auto-generated by grpc-helper
*/

import * as grpc from '@midwayjs/grpc';

// Generated namespace
export namespace helloworld {

  // Definition used by the server
  export interface Greeter {
    // Sends a greeting
    sayHello(data: HelloRequest): Promise<HelloReply>;
  }

  // Definition used by the client
  export interface GreeterClient {
    // Sends a greeting
    sayHello(options?: grpc.IClientOptions): grpc.IClientUnaryService<HelloRequest, HelloReply>;
  }

  // Request body structure
  export interface HelloRequest {
    name?: string;
  }

  // Response body structure
  export interface HelloReply {
    message?: string;
  }
}

```

:::info
Whenever The proto file is modified, the corresponding service definition needs to be regenerated, and then the corresponding method is implemented.
:::



## Provide gRPC service (Provider)


### Writing Service Provider (Provider)


In the `src/provider` directory, we create `greeter.ts` as follows
```typescript
import {
  MSProviderType,
  Provider,
  GrpcMethod
} from '@midwayjs/core';
import { helloworld } from '../domain/helloworld';

/**
 * Implementation of helloworld.Greeter Interface Services
 */
@Provider(MSProviderType.GRPC, { package: 'helloworld' })
export class Greeter implements helloworld.Greeter {

  @GrpcMethod()
  async sayHello(request: helloworld.HelloRequest) {
    return { message: 'Hello '+ request.name };
  }
}

```
:::info
Note that the @Provider decorator is different from the @Provide decorator, the former is used to provide services, and the latter is used to rely on the class identified by the injection container scan.
:::


We use the `@Provider` to expose an RPC service. The first parameter of the `@Provider` is the RPC service type. This parameter is an enumeration. Here, select the GRPC type.


The second parameter of the `@Provider` is the metadata of the RPC service, which refers to the metadata of the gRPC service. Here, you need to write the package field of the gRPC, that is, the package field in the proto file (the field here is used to correspond to the field after the proto file is loaded).


For ordinary gRPC service interfaces (UnaryCall), we only need to use the `@GrpcMethod()` decorator. The modification method is the service definition itself, the input parameter is the input parameter defined in proto, and the return value is the defined response body.

:::info
Note that the generated Interface is to better write service code and standardize the structure. Please be sure to write according to the definition.
:::


### Configuration service


The content is as follows.
```typescript
// src/config/config.default
import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo): MidwayConfig => {
  return {
    // ...
    grpcServer: {
      services: [
        {
          protoPath: join(appInfo.appDir, 'proto/hero.proto')
          package: 'hero',
        },
        {
          protoPath: join(appInfo.appDir, 'proto/helloworld.proto')
          package: 'helloworld',
        }
      ],
    }
  };
}
```
services fields are arrays, which means that Midway projects can publish multiple gRPC services at the same time. The structure of each service is:

| Property | Type | Description |
| --- | --- | --- |
| protoPath | String | Required, absolute path of proto file |
| package | String | Required, the package corresponding to the service |

In addition to the Service configuration, there are some other configurations.

| Property | Type | Description |
| ------------- | ----------------- | ------------------------------------------------------------ |
| url | String            | Optional, gRPC service address, default 6565 port，like 'localhost:6565' |
| loaderOptions | Object | Optional, the options of the proto file loader |
| credentials | ServerCredentials | Optional. credentials parameter options when grpc Server binding |
| serverOptions | ChannelOptions | Optional. [Custom options](https://github.com/grpc/grpc-node/tree/master/packages/grpc-js#supported-channel-options) for grpc Server |



### Provide security certificate

Security certificates can be passed through `credentials` parameters.

```typescript
// src/config/config.default
import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';
import { ServerCredentials } from '@midwayjs/grpc';
import { readFileSync } from 'fs';
import { join } from 'path';

const cert = readFileSync(join(__dirname, './cert/server.crt'));
const pem = readFileSync(join(__dirname, './cert/server.pem'));
const key = readFileSync(join(__dirname, './cert/server.key'));

export default (appInfo: MidwayAppInfo): MidwayConfig => {
  return {
    // ...
    grpcServer: {
      // ...
      credentials: ServerCredentials.createSsl(cert, [{ private_key: key, cert_chain: pem }]);
    }
  };
}
```



### Write unit tests

The `@midwayjs/grpc` library provides a `createGRPCConsumer` method for calling clients in real time. Generally, we use this method for testing.

:::caution
This method will be connected in real time every time it is called. It is not recommended to use this method in a production environment.
:::


Written in the test as follows.
```typescript
import { createApp, close } from '@midwayjs/mock';
import { Framework, createGRPCConsumer } from '@midwayjs/grpc';
import { join } from 'path';
import { helloworld } from '../src/domain/helloworld';

describe('test/index.test.ts', () => {

  it('should create multiple grpc service in one server', async () => {
    const baseDir = join(__dirname, '../');

    // Create Service
    const app = await createApp<Framework>();

    // Call service
    const service = await createGRPCConsumer<helloworld. GreeterClient>({
      package: 'helloworld',
      protoPath: join(baseDir, 'proto', 'helloworld.proto'),
      url: 'localhost:6565'
    });

    const result = await service.sayHello().sendMessage({
      name: 'harry'
    });

    expect(result.message).toEqual('Hello harry');
    await close(app);
  });

});

```



## Call gRPC service (Consumer)


We write a gRPC service to invoke the exposed service above.

:::info
In fact, you can call it in the Controller of the Web, or Service and other places, here is just an example.
:::


### Call configuration


You need to add the target service you need to call and its proto file information to `src/config/config.default.ts`.


For example, here we fill in the service itself exposed above, as well as the service's Proto, package name and other information (function form).
```typescript
// src/config/config.default
import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo): MidwayConfig => {
  return {
    // ...
    grpc: {
      services: [
        {
          url: 'localhost:6565',
          protoPath: join(appInfo.appDir, 'proto/helloworld.proto'),
          package: 'helloworld',
        },
      ],
    },
  };
}
```


### Code call


After configuration, we can call it in the code.


`@midwayjs/grpc` provides `clients` to easily obtain configured services. We just need to inject this object where it needs to be injected.


For example:
```typescript
import {
  Provide,
  Inject,
} from '@midwayjs/core';
import { helloworld, hero } from '../interface';
import { Clients } from '@midwayjs/grpc';

@Provide()
export class UserService {
  @Inject()
  grpcClients: Clients;

}
```


We get the client instance of the other service through the `clients` and call it.


```typescript
import {
  Provide,
  Inject,
} from '@midwayjs/core';
import { helloworld, hero } from '../interface';
import { Clients } from '@midwayjs/grpc';

@Provide()
export class UserService {
  @Inject()
  grpcClients: Clients;

  async invoke() {
    // Get Services
  	const greeterService = this.grpcClients.getService<helloworld. GreeterClient> (
      'helloworld. Greeter'
    );

    // Call service
    const result = await greeterService.sayHello()
    	.sendMessage({
        name: 'harry'
      });

    // Return result
    return result;
  }

}
```


You can also use the `@Init` decorator to cache the services to be called to properties. This can be reused when other methods are called.


An example is as follows.
```typescript
import {
  GrpcMethod,
  MSProviderType,
  Provider,
  Inject,
  Init,
} from '@midwayjs/core';
import { helloworld, hero } from '../interface';
import { Clients } from '@midwayjs/grpc';

@Provider(MSProviderType.GRPC, { package: 'hero' })
export class HeroService implements hero.HeroService {
  // Injection client
  @Inject()
  grpcClients: Clients;

  greeterService: helloworld.GreeterClient;

  @Init()
  async init() {
    // Assign a service instance
    this.greeterService = this.grpcClients.getService<helloworld. GreeterClient> (
      'helloworld. Greeter'
    );
  }

  @GrpcMethod()
  async findOne(data) {
    // Call service
    const result = await greeterService.sayHello()
    	.sendMessage({
        name: 'harry'
      });

    // Return result
    return result;
  }
}

```


## Streaming service


The streaming service of gRPC is used to reduce connections so that servers or clients can execute tasks without waiting, thus improving execution efficiency.


There are three types of gRPC streaming services. From the perspective of the server,


- Server receives flow (client push)
- Server response flow (server push)
- Bidirectional flow



We will introduce them one by one.


### Streaming proto file


The proto file for streaming is written differently. You must mark the `stream` parameter where you want to use the stream.
```protobuf

syntax = "proto3";

package math;

message AddArgs {
  int32 id = 1;
  int32 num = 2;
}

message Num {
  int32 id = 1;
  int32 num = 2;
}

service Math {
  rpc Add (AddArgs) returns (Num) {
  }

	// Bidirectional flow
  rpc AddMore (stream AddArgs) returns (stream Num) {
  }

  // The server pushes to the client.
  rpc SumMany (AddArgs) returns (stream Num) {
  }

  // The client pushes to the server.
  rpc AddMany (stream AddArgs) returns (Num) {
  }
}

```
The interface generated by this service is defined:


```typescript
import {
  IClientDuplexStreamService,
  IClientReadableStreamService,
  IClientUnaryService,
  IClientWritableStreamService,
  IClientOptions,
} from '@midwayjs/grpc';

export namespace math {
  export interface AddArgs {
    id?: number;
    num?: number;
  }
  export interface Num {
    id?: number;
    num?: number;
  }

  /**
   * server interface
   */
  export interface Math {
    add(data: AddArgs): Promise<Num>;
    addMore(data: AddArgs): Promise<void>;
    // server push, client read
    sumMany(data: AddArgs): Promise<void>
    // client push，server read
    addMany(num: AddArgs): Promise<void>;
  }

  /**
   * client interface
   */
  export interface MathClient {
    add(options?: IClientOptions): IClientUnaryService<AddArgs, Num>;
    addMore(options?: IClientOptions): IClientDuplexStreamService<AddArgs, Num>;
    // server push, client read
    sumMany(options?: IClientOptions): IClientReadableStreamService<AddArgs, Num>;
    // Push on the client side and read on the server side
    addMany(options?: IClientOptions): IClientWritableStreamService<AddArgs, Num>;
  }
}

```


### Server push


The client calls once and the server can return multiple times. The streaming type is identified by the parameter of `@GrpcMethod()`.


The available types are:


- `GrpcStreamTypeEnum.WRITEABLE` the server output stream (single work)
- `GrpcStreamTypeEnum.READABLE` the client output stream (single work), the server accepts multiple times
- `GrpcStreamTypeEnum.DUPLEX` duplex flow



The server example is as follows:
```typescript
import { GrpcMethod, GrpcStreamTypeEnum, Inject, MSProviderType, Provider } from '@midwayjs/core';
import { Context, Metadata } from '@midwayjs/grpc';
import { math } from '../interface';

/**
 */
@Provider(MSProviderType.GRPC, { package: 'math' })
export class Math implements math.Math {

  @Inject()
  ctx: Context;

  @GrpcMethod({type: GrpcStreamTypeEnum.WRITEABLE })
  async sumMany(args: math.AddArgs) {
    this.ctx.write({
      num: 1 + args.num
    });
    this.ctx.write({
      num: 2 + args.num
    });
    this.ctx.write({
      num: 3 + args.num
    });

    this.ctx.end();
  }

  // ...
}

```
The server uses the `ctx.write` method to return data. You can return data multiple times because it is a server stream.


After the response is completed, use the `ctx.end()` method to disable the flow.


The client, called once, accepts multiple data.


For example, the accumulation logic below.


Promise writing method, it will wait for the server data to return before processing.
```typescript
// Server push
let total = 0;
let result = await service.sumMany().sendMessage({
  num: 1
});

result.forEach(data => {
  total += data.num;
});

// total = 9;
```


Event writing, real-time processing.
```typescript
// Server push
let call = service.sumMany().getCall();

call.on('data', data => {
	// do something
});

call.sendMessage({
  num: 1
});

```


### Client push


The client calls multiple times, the server receives data multiple times, and returns a result. The streaming type is identified by the parameter of `@GrpcMethod({type: GrpcStreamTypeEnum.READABLE})`.


The server example is as follows:
```typescript
import { GrpcMethod, GrpcStreamTypeEnum, Inject, MSProviderType, Provider } from '@midwayjs/core';
import { Context, Metadata } from '@midwayjs/grpc';
import { math } from '../interface';

/**
 */
@Provider(MSProviderType.GRPC, { package: 'math' })
export class Math implements math.Math {

  sumDataList: number[] = [];

  @Inject()
  ctx: Context;

  @GrpcMethod({type: GrpcStreamTypeEnum.READABLE, onEnd: 'sumEnd' })
  async addMany(data: math.Num) {
    this.sumDataList.push(data);
  }

  async sumEnd(): Promise<math.Num> {
    const total = this.sumDataList.reduce((pre, cur) => {
      return {
        num: pre.num + cur.num
      }
    });
    return total;
  }

  // ...
}

```


Each time the client calls, the `addMany` method is triggered.


After the client sends the `end` event, the method specified by the `onEnd` parameter on the `@GrpcMethod` decorator is called, and the return value of this method is the value obtained by the last client.


The client example is as follows:
```typescript
// Client push
const data = await service.addMany()
.sendMessage({num: 1})
.sendMessage({num: 2})
.sendMessage({num: 3})
.end();

// data.num = 6
```


### Bidirectional flow


The client can call multiple times, and the server can also receive multiple data and return multiple results, similar to traditional TCP communication. The duplex streaming type is identified by the parameter of `@GrpcMethod({type: GrpcStreamTypeEnum.DUPLEX})`.


The server example is as follows:
```typescript
import { GrpcMethod, GrpcStreamTypeEnum, Inject, MSProviderType, Provider } from '@midwayjs/core';
import { Context, Metadata } from '@midwayjs/grpc';
import { math } from '../interface';

/**
 */
@Provider(MSProviderType.GRPC, { package: 'math' })
export class Math implements math.Math {

  @Inject()
  ctx: Context;

  @GrpcMethod({type: GrpcStreamTypeEnum.DUPLEX, onEnd: 'duplexEnd' })
  async addMore(message: math.AddArgs) {
    this.ctx.write({
      id: message.id
      num: message.num +10
    });
  }

  async duplexEnd() {
    console.log('got client end message');
  }
  // ...
}

```
The server can use `ctx.write` to return data at any time, or use `ctx.end` to disable the flow.


Client example:


For clients of duplex communication, because the order of calling and returning cannot be guaranteed, we need to use the listening mode to consume the results.
```typescript
const clientStream = service.addMore().getCall();

let total = 0;
let idx = 0;

duplexCall.on('data', (data: math.Num) => {
  total += data.num;
  idx++;
  if (idx === 2) {
    duplexCall.end();
    // total => 29
  }
});

duplexCall.write({
  num: 3,
});

duplexCall.write({
  num: 6
});
```


If you want to ensure the order of calls, we also provide a two-way flow call method that guarantees the order, but you need to define a fixed ID in the Proto to to ensure the order.


For example, our Math.proto adds a fixed id to each entry and exit parameter, so the order can be fixed.
```typescript

syntax = "proto3";

package math;

message AddArgs {
  int32 id = 1; // The id name here is fixed
  int32 num = 2;
}

message Num {
  int32 id = 1; // The id name here is fixed
  int32 num = 2;
}

service Math {
  rpc Add (AddArgs) returns (Num) {
  }

  rpc AddMore (stream AddArgs) returns (stream Num) {
  }

  // The server pushes to the client.
  rpc SumMany (AddArgs) returns (stream Num) {
  }

  // The client pushes to the server.
  rpc AddMany (stream AddArgs) returns (Num) {
  }
}

```
The fixed-order client calls are as follows:
```typescript
// Ensure sequential bidirectional flow
const t = service.addMore();

const result4 = await new Promise<number>((resolve, reject) => {

  let total = 0;

  // First call and return
  t.sendMessage({
    num: 2
  })
    .then(res => {
      expect(res.num).toEqual(12);
      total += res.num;
  	})
    .catch(err => console.error(err));

  // Second call and return
  t.sendMessage({
    num: 5
  }).then(res => {
      expect(res.num).toEqual(15);
      total += res.num;
      resolve(total);
    })
    .catch(err => console.error(err));

  t.end();
});

// result4 => 27
```
The default ID is `id`. If the server definition is different, you can change it.
```typescript
// Ensure sequential bidirectional flow
const t = service.addMore({
  messageKey: 'uid'
});
```


## Metadata (Metadata)


The metadata of gRPC is equivalent to the HTTP context.


The server returns metadata through the `ctx.sendMetadata` method, and can also obtain the metadata passed by the client through `ctx.metadata`.
```typescript
import {
  MSProviderType,
  Provider,
  GrpcMethod
} from '@midwayjs/core';
import { helloworld } from '../domain/helloworld';
import { Context, Metadata } from '@midwayjs/grpc';

/**
 * Implementation of helloworld.Greeter Interface Services
 */
@Provider(MSProviderType.GRPC, { package: 'helloworld' })
export class Greeter implements helloworld.Greeter {

  @Inject()
  ctx: Context;

  @GrpcMethod()
  async sayHello(request: helloworld.HelloRequest) {

    // Metadata passed by the client
    console.log(this.ctx.metadata);

    // Create metadata
    const meta = new Metadata();
    this.ctx.metadata.add('xxx', 'bbb');
    this.ctx.sendMetadata(meta);

    return { message: 'Hello '+ request.name };
  }
}
```


The client passes metadata through the options parameters of the method.
```typescript
import { Metadata } from '@midwayjs/grpc';

const meta = new Metadata();
meta.add('key', 'value');

const result = await service.sayHello({
  metadata: meta
}).sendMessage({
  name: 'harry'
});
```


Getting metadata is relatively cumbersome.


Ordinary unary calls (UnaryCall) require `sendMessageWithCallback` methods to obtain metadata.
```typescript
const call = service.sayHello().sendMessageWithCallback({
  name: 'zhangting'
}, (err) => {
  if (err) {
    reject(err);
  }
});
call.on('metadata', (meta) => {
  // output meta
});
```
For other streaming services, you can directly subscribe to the original client stream object by `getCall()` method.
```typescript
// Get the service. Note that there is no await here.
const call = service.addMany().getCall();
call.on('metadata', (meta) => {
  // output meta
});
```


## Timeout processing


We can pass parameters in milliseconds when calling the service.
```typescript
const result = await service.sayHello({
  timeout: 5000
}).sendMessage({
  name: 'harry'
});
```
