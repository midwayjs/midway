---
title: 框架扩展
---

Midway 提供了一套可以自定义框架的能力，如果 Midway 没有提供某种上层框架能力，则可以自定义接入。

## 框架和组件的区别

Midway 有着组件和框架的概念，两者有一些区别。

框架（Framework）是一个可以独立运行，独立提供特定服务的模块，一般会暴露端口，绑定协议，承接上游流量，比如 @midwayjs/web （包装 Egg.js，提供 HTTP 服务），@midwayjs/grpc（包装 grpc.js，提供 gRPC 服务）。

组件（Component）是一个可复用与多框架的模块包，一般用于几种场景：

- 1、包装往下游调用的代码，包裹三方模块简化使用，比如 orm（数据库调用），swagger（简化使用） 等
- 2、可复用的业务逻辑，比如抽象出来的公共 Controller，Service 等

不管是框架和组件，都可以发布到 npm 包。

在某些情况下，一个 npm 包可以既包含框架， 又包含组件，那么说明该 npm 包既可以暴露服务，又可以往下游调用。比如 @midwayjs/grpc ，既可以暴露 gRPC 服务，又可以往下游调用 gRPC 服务。

整个区分如下图，任意一个框架（暴露服务）加上大部分组件（下游调用+复用扩展）为业务场景服务。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1612541348981-bc32540f-e9b2-4375-9bdd-c77231b17c81.png#height=550&id=HPSqp&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1100&originWidth=1930&originalType=binary&ratio=1&size=282162&status=done&style=none&width=965" width="965" />

## 框架（Framework）概念

Midway 现有的框架（Framework）每个是独立的，每一个框架都可以单独在进程中运行，理论上来说，每个框架都是一个独立的依赖注入容器，加上特定框架包含的三方库的组合。

这些独立的框架，都遵循 `IMidwayFramewok`  的接口定义，由 `@midwayjs/bootstrap`  库加载起来。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1612086965489-9d1659ff-7440-40ac-a57a-f9195c57a73e.png#height=642&id=TLWHg&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1284&originWidth=1888&originalType=binary&ratio=1&size=159418&status=done&style=none&width=944" width="944" />

所以在提供的单进程部署方案中，我们可以通过一个 `bootstrap.js`  入口来启动应用。

```typescript
// bootstrap.js

const WebFramework = require('@midwayjs/koa').Framework;
const web = new WebFramework().configure({
  port: 7001,
});

const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.load(web).run();
```

## 框架启动生命周期

这里的介绍的生命周期不同于用户在 `configuration.ts`  中编写的 `onReady` 、 `onStop` ，而是更顶层从整个框架的角度来看的周期，用户的 `onReady` 、 `onStop` 是其中的一小部分。

整个框架的生命周期分为初始化、运行、停止三个部分，由 [@midwayjs/bootstrap](https://www.npmjs.com/package/@midwayjs/bootstrap) 库来处理。

如下图，左侧是 `@midwayjs/bootstrap`  启动提供的阶段，右侧是对应阶段框架（Framework）所执行的方法。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1612086533035-970240ed-6ea9-48d8-aaef-985082b7dacd.png#height=944&id=HXGoc&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1888&originWidth=1784&originalType=binary&ratio=1&size=170229&status=done&style=none&width=892" width="892" />

对于完全自定义框架，每个阶段都可以进行修改和覆盖。

| **启动流程**                |                                                          |
| --------------------------- | -------------------------------------------------------- |
| beforeContainerInitialize   | 容器初始化之前，可以修改容器配置入参                     |
| containerInitialize         | 创建依赖注入容器，new MidwayContainer()                  |
| afterContainerInitialize    | 容器初始化之后，目录加载之前                             |
| containerDirectoryLoad      | 容器加载目录，创建对象定义                               |
| afterContainerDirectoryLoad | 容器目录加载之后                                         |
| applicationInitialize       | 第三方应用初始化                                         |
| containerReady              | 容器刷新，触发生命周期，在这个阶段，会执行业务的 onReady |
| afterContainerReady         | 容器生命周期触发后                                       |
|                             |                                                          |
| **关闭流程**                |                                                          |
| beforeStop                  | 框架关闭前，会执行业务的 onStop                          |
| stop                        | 框架关闭                                                 |
|                             |                                                          |

下面我们来演示如何修改这些生命周期的阶段。

## 编写自定义 Framework

一般用户使用现成的 Framework 即可，自定义组件也能满足大部分的场景。
​

但是在特殊情况下，比如团队需要额外扩展，或者固定一些能力，同时不希望每个使用者额外修改代码，这个时候就需要完全自定义框架（Framework）的功能。
​

除了完全重写框架之外，用户也可以基于现有的 koa/express/gRPC 等框架编写属于自己的 Framework。下面我们就来解释如何扩展。

### 基于现有框架扩展

​

这里以扩展 `@midwayjs/koa`  为例。大部分的情况，我们都只需要修改 `applicationInitialize`  方法。

比如，我们接下去的需求为，给 `@midwayjs/koa`  框架增加默认的 bodyParser。其基本思路为，继承现有的 `midwayjs/koa`  框架，在其 app 对象之上默认加入一个中间件。

示例代码如下：

```typescript
import { Framework } from '@midwayjs/koa';
import * as bodyParser from 'koa-bodyparser';

export class CustomKoaFramework extends Framework {
  async applicationInitialize(options) {
    // 执行父类的 app 初始化
    await super.applicationInitialize(options);

    // this.app 初始化完之后就有值了，可以直接去 use 中间件了
    this.app.use(bodyParser(this.getConfiguration('bodyParser')));
  }
}
```

:::info
每个框架，Midway 开发者都会导出 Framework 这个属性，指向当前库的 Framework。
:::

完成框架扩展后，我们要将它导出。框架的约定是，默认导出为 `Framework` 。

```typescript
export { CustomKoaFramework as Framework } from './custom';
```

这样，我们的 Framework 就修改完毕了，我们可以将它包成新的 npm，提供给外部使用。

### 完全自定义 Framework

对于没有提供基础框架的场景，我们可以从基础的 `BaseFramework` 开始扩展。

`BaseFrameowk`  类，用于方便的向上扩展。

- 依赖注入容器加载、扫描、初始化
- 组件加载，业务配置加载、生命周期加载
- 默认的 Provide/Inject/Config/App/Aspect/Init 等基础装饰器的支持
- 默认的全局日志和上下文日志，并做好的切割管理

由于 `BaseFrameowk` 是个抽象类，所以需要实现的方法有：

- `applicationInitialize`  初始化一个三方库的 app
- `run`  三方 app 运行的方式（比如监听端口）

以及一些需要的基础类型定义：

```typescript
export class BaseFramework<
  APP extends IMidwayApplication<CTX>,
  CTX extends IMidwayContext,
  OPT extends IConfigurationOptions
> implements IMidwayFramework<APP, OPT> {}
```

第一个， `APP` 是 IMidwayApplication 类型，一般来说，这个 Application 类型是我们实际的应用类型，比如 Express 、Koa，EggJS 的 app 对象 ，或者是其他相似的对象实例。

第二个 `CTX` 是 IMidwayContext 类型，一般我们会自定一个上下文对象，用于存放上下文的信息，比如启动时间，请求作用域容器等。

第三个 `OPT` 是这个框架对应的配置信息，我们定义为继承 `IConfigurationOptions` 这个类型的对象，指的是在启动时需要传入给该框架的参数。比如在 HTTP 时的端口信息等。

接下去我们会以实现一个基础的 HTTP 服务框架作为示例。下面的代码是该框架的核心部分。

```typescript
import { BaseFramework, IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as http from 'http';

// 定义一些上层业务要使用的定义
export interface Context extends IMidwayContext {}

export interface Application extends IMidwayApplication<Context> {}

// 这里是 new Framework().configure({...}) 传递的参数定义
export interface IMidwayCustomConfigurationOptions extends IConfigurationOptions {
  port: number;
}

// 实现一个自定义框架，继承基础框架
export class MidwayCustomHTTPFramework extends BaseFramework<Application, Context, IMidwayCustomConfigurationOptions> {
  public app: Application;

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    // 创建一个 app 实例
    this.app = http.createServer((req, res) => {
      // 创建请求上下文，自带了 logger，请求作用域等
      const ctx = this.app.createAnonymousContext();
      // 从请求上下文拿到注入的服务
      ctx.requestContext
        .getAsync('xxxx')
        .then((ins) => {
          // 调用服务
          return ins.xxx();
        })
        .then(() => {
          // 请求结束
          res.end();
        });
    });

    // 给 app 绑定上 midway 框架需要的一些方法，比如 getConfig, getLogger 等。
    this.defineApplicationProperties();
  }

  async run() {
    // 启动的参数，这里只定义了启动的 HTTP 端口
    if (this.configurationOptions.port) {
      new Promise<void>((resolve) => {
        this.server.listen(this.configurationOptions.port, () => {
          resolve();
        });
      });
    }
  }
}
```

我们定义了一个 `MidwayCustomHTTPFramework` 类，继承了 `BaseFramework` ，同时实现了 `applicationInitialize`  和 `run`  方法。

这样，一个最基础的框架就完成了。

最后，我们只要按照约定，将 Framework 导出即可。

```typescript
export {
  Application,
  Context,
  MidwayCustomHTTPFramework as Framework,
  IMidwayCustomConfigurationOptions,
} from './custom';
```

上面是一个最简单的框架示例。事实上，Midway 所有的框架都是这么编写的。

### 一些约定

自定义框架导出，除了约定的 `Framework`  之外，对于用户常用的定义，我们也有一些习惯性约定。

- 1、一般来说，我们将应用和请求上下文，约定为 `Application`  和 `Context`
- 2、一般来说，默认的配置定义，我们约定为 `DefaultConfig`

## 自定义框架启动

`@midwayjs/bootstrap`  能启动任意的基于 `IMidwayFramework`  实现的框架。只要我们导出了 `Framework`  属性即可。

```typescript
// bootstrap.js

const Framework = require('xxxxx').Framework;
const framework = new Framework().configure({
  port: 7001,
});

const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.load(framework).run();
```

## 自定义框架让用户开发和测试

`@midwayjs/mock`  除了提供 app 的测试外，也提供了创建框架的方法，和应用测试类似，我们通过 `create`  方法创建一个框架实例。

```typescript
import { Framework } from 'xxxxxx';
import { create } from '@midwayjs/mock';

describe('/test/framework.test.ts', () => {

	it('test framework', async () => {

  	// create framework with user code
		const framework = await create<Framework>();
  }

}
```
