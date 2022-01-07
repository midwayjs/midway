---
title: 多框架研发
---

所谓的多框架启动，指的是多个能提供服务的上层框架，在一个进程中同时提供服务。

这里的多个上层框架，指的是 midway 提供的 `@midwayjs/web` ， `@midwayjs/koa` , `@midwayjs/express` , `@midwayjs/socektio` , `@midwayjs/grpc` , `@midwayjs/rabbitmq`  等。

这些框架都能独立对外提供服务，暴露某个协议。比如 @midwayjs/web （包装 Egg.js，提供 HTTP   服务），@midwayjs/grpc（包装 grpc.js，提供 gRPC 服务）。

## 框架（Framework）概念

Midway 现有的框架（Framework）每个是独立的，每一个框架都可以单独在进程中运行，理论上来说，每个框架都是一个独立的依赖注入容器，加上特定框架包含的三方库的组合。

这些独立的框架，都遵循 `IMidwayFramewok` 的接口定义，由 `@midwayjs/bootstrap` 库加载起来。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1612086965489-9d1659ff-7440-40ac-a57a-f9195c57a73e.png#height=642&id=uuRd5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1284&originWidth=1888&originalType=binary&ratio=1&size=159418&status=done&style=none&width=944" width="944" />

所以在提供的单进程部署方案中，我们可以通过一个 `bootstrap.js` 入口来启动应用。

```typescript
// bootstrap.js

const WebFramework = require('@midwayjs/koa').Framework;
const web = new WebFramework().configure({
  port: 7001,
});

const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.load(web).run();
```

## 多个框架启动文件（主副框架）

如果我们需要启动多个上层框架，可以利用 `load`  方法加载多次  。

```typescript
// bootstrap.js

const WebFramework = require('@midwayjs/koa').Framework;
const GRPCFramework = require('@midwayjs/grpc').Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

const web = new WebFramework().configure({
  port: 7001,
});

const grpcService = new GRPCFramemwork().configure({
  services: [
    {
      protoPath: join(__dirname, 'proto/helloworld.proto'),
      package: 'helloworld',
    },
  ],
});

Bootstrap.load(web).load(grpcService).run();
```

:::info
注意，所有的上层框架都会遵循规范，导出一个 Framework 属性。
:::

这里有一个主、副框架的概念。

**第一个被 load 的框架为主框架，后面被 load 的都为副框架。**

比如，上面示例的 `@midwayjs/koa`  为主框架， `@midwayjs/grpc`  为副框架。

主框架只能一个，而副框架可以有多个。

:::info
主框架在使用时略微有一些优势。
:::

## 启动多框架

多框架启动需要依赖启动文件。

在本地开发时，我们之前使用 `midway-bin dev --ts`  命令，需要增加一个 `entryFile`  的入口参数。

```bash
$ cross-env NODE_ENV=local midway-bin dev --ts --entryFile=bootstrap.js
```

:::info
`bootstrap.js`  会自动判断 ts 环境，在本地开发时会加载 src 下的 ts 文件。
:::

在服务器部署时，由于脚手架自带了 `bootstrap.js`  文件，直接修改即可，启动文件依旧为 start 命令（注意，启动前需要执行 npm run build 先将 ts 构建为 js）。

```bash
$ cross-env NODE_ENV=production node bootstrap.js
```

**多框架场景不支持使用 egg-scripts 部署。**

## 多框架生命周期

业务代码中生命周期的 `onReady`  方法在一个进程只执行一次。

:::info
在 egg 场景下，只会在 worker 进程生效。
:::

```typescript
import { Configuration } from '@midwayjs/decorator';
import { Application } from '@midwayjs/koa';
import { Application as GRPCApplication } from '@midwayjs/grpc';

@Configuration()
export class AutoConfiguration {
  async onReady() {
    // 这个 onReady 方法只会执行一次
  }
}
```

## 全局的依赖注入容器

所有的框架将共享同一个依赖注入容器。

如下图，启动器（@midwayjs/bootstrap）模块将提前初始化一个依赖注入容器 A，在后续所有的框架中，都将复用这个依赖注入容器 A。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1616483855279-c4efe465-6783-4aa7-b156-1fee8fedd777.png#height=878&id=FXtTw&margin=%5Bobject%20Object%5D&name=image.png&originHeight=878&originWidth=1148&originalType=binary&ratio=1&size=86904&status=done&style=none&width=1148" width="1148" />

这意味这，在任意框架注入到容器中的单例，在其他框架也可以取到。

## 多框架获取应用（app）对象

如果需要不同框架的 app ，比如需要 web app 加载中间件，以及 grpc app 做初始化，我们可以通过 `@App` 的参数来注入不同框架的 app 实例。

如果不传递 `@App`  装饰器的参数，默认注入的 app 为**主框架 app**。

如果需要副框架的 app，请传递框架类型参数。框架的类型，是一个 `MidwayFrameworkType`  类型的枚举值。

```typescript
import { Configuration, MidwayFrameworkType } from '@midwayjs/decorator';
import { Application } from '@midwayjs/koa';
import { Application as GRPCApplication } from '@midwayjs/grpc';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  // 注入不同的 app
  @App(MidwayFrameworkType.MS_GRPC)
  grpcApp: GRPCApplication;

  async onReady() {}
}
```

对于其他服务类来说，一般不会需要获取和框架相关联的 app 属性，常用的 API 比如 `getLogger` ， `getApplicationContext` ， `getBaseDir`  等方法，在所有的 app 返回是一致的，一般直接使用主框架的 app 即可（事实上你不需要知道是哪个框架）。

```typescript
import { Provide, App } from '@midwayjs/decorator';
import { IMidwayApplication } from '@midwayjs/core';

@Provide()
export class UserService {
  @App()
  app: IMidwayApplication; // 推荐使用这个定义，所有的框架都会实现这个定义
}
```

## 多框架上下文处理

对于接入层（Controller，Socket 等暴露服务的），都是固定某一种框架和协议的，所以注入的 Context 是固定的。

```typescript
import { Provide, Inject, Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Provide()
@Controller()
export class HomeController {
  @Inject()
  ctx: Context; // 这里注入的一定是匹配当前框架的上下文

  @Get()
  async getMethod() {}
}
```

对于服务层来说，由于代码是一份，上下文对象有可能随着请求的不同，而随着框架变动。

我们不建议在 Service 层去获取跟 Controller（协议层）相关的代码，当前的上下文对象透传只是为了传递一些请求链路的数据（比如 open-tracing）。

比如在 web 场景下：

```typescript
import { Provide, Inject, Get } from '@midwayjs/decorator';

@Provide()
export class UserService {
  @Inject()
  ctx: any;

  async getUser() {
    // ctx.query.id      // 不推荐在 service 调用协议相关的代码
  }
}
```

推荐的用法是使用和协议层无关的定义：

```typescript
import { Provide, Inject, Get } from '@midwayjs/decorator';
import { IMidwayContext } from '@midwayjs/core';

@Provide()
export class UserService {
  @Inject()
  ctx: IMidwayContext; // 这个定义仅有一些特定的属性

  async getUser() {
    // ctx.logger
  }
}
```

在实在需要特定框架的上下文的场景下，依旧可以使用原框架的定义（不太推荐）。

```typescript
import { Provide, Inject, Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { Context as GRPCContext } from '@midwayjs/grpc';

@Provide()
export class UserService {
  @Inject()
  ctx: Context & GRPCContext;

  async getUser() {
    // ctx.xxxxx
  }
}
```

## 入口文件加载环境配置

如果框架初始化的配置较长或者有时候用户希望放到 `src/config.default.ts`  下，可以使用我们提供的回调写法，回调的参数为当前环境的配置对象。

比如 `config.default.ts`  中。

```typescript
// config.default
export const cluster = {
  port: 7001,
};

export const grpcServer = {
  services: [
    {
      protoPath: join(__dirname, 'proto/helloworld.proto'),
      package: 'helloworld',
    },
  ],
};
```

那么在入口的地方，也可以这么写：

```typescript
const WebFramework = require('@midwayjs/koa').Framework;
const GRPCFramework = require('@midwayjs/grpc').Framework;
const { Bootstrap } = require('@midwayjs/bootstrap');

Bootstrap.load((config) => {
  return new WebFramework().configure(config.cluster);
})
  .load((config) => {
    return new GRPCFramemwork().configure(config.grpcServer);
  })
  .run();
```

这样的好处是，入口的配置可以随着环境变化。

注意，这个功能是由 Midway 提供的，必须要在 `configuration.ts`  中开启 `importConfigs`  功能。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/'), // 该功能依靠这段代码查找配置
  ],
})
export class ContainerLifeCycle {}
```

:::info
只会读取到用户代码和 midway 组件的配置，egg 插件的配置不会被读取到。
:::

## 框架前异步逻辑（异步配置）

我们可以在所有的框架启动之前，做一些异步的行为，比如比较常见的在启动前使用异步加载配置。

`Bootstrap`  提供了 `before`  方法用于在所有的框架前执行异步操作。

```typescript
Bootstrap.load(webFramework)
  .load(grpcFramework)
  .before(async (container) => {
    // ...
  })
  .run();
```

以一个异步配置加载为例，我们的需求是在应用启动前，从远端拉取配置，并合并到业务的配置中。

首先定义一个异步获取配置的类，比如 `src/remoteConfigService.ts` 。

```typescript
import { App, Provide, Init } from '@midwayjs/decorator';
import { IMidwayApplication } from '@midwayjs/core';

@Provide()
export class RemoteConfigService {
  @App()
  app: IMidwayApplication;

  @Init()
  async syncConfig() {
    // 这里获取一个远端的配置，HTTP，或者订阅其他的配置协议
    const remoteConfig = await this.getRemote();

    // 将配置合并到全局的配置服务中
    this.app.addConfigObject(remoteConfig);
  }
}
```

然后在所有框架启动时激活它。

```typescript
Bootstrap.load(webFramework)
  .load(grpcFramework)
  .before(async (container) => {
    await container.getAsync(RemoteConfigService);
  })
  .run();
```

这里的 `container` 是我们的全局依赖注入容器，等价于 `app.getApplicationContext()` ，所以**获取的服务是单例**。

由于我们使用了 `@Init`  装饰器，所以在创建实例的时候就会被触发，并且保留在内存中。代码的流程和在应用中相同。

这里使用了 `app.addConfigObject`  方法和应用中的配置合并，后续业务中使用 `@Config`  获取配置的时候，就能拿到最终的配置了。

## 多框架测试

传统单框架，我们使用 `createApp`  方法进行测试，获取到 app 对象后做操作，但是在多框架下，稍有不同，会创建出多个框架的 app 实例。

`@midwayjs/mock`  提供了 `createBootstrap`  方法做启动文件类型的测试。我们可以将入口文件 `bootstrap.js`  作为启动参数传入，这样 `createBootstrap`  方法会通过入口文件来启动代码。

```typescript
import { createBootstrap } from '@midwayjs/mock';
import { MidwayFrameworkType } from '@midwayjs/decorator';

describe('/test/new.test.ts', () => {
  it('should GET /', async () => {
    // create app
    const bootstrap = await createBootstrap(join(process.cwd(), 'bootstrap.js'));
    const app = bootstrap.getApp(MidwayFrameworkType.WEB_KOA);

    // expect and test

    // close bootstrap
    await bootstrap.close();
  });
});
```

具体请参考 [使用 bootstrap 文件测试](testing#MgzE6)。
