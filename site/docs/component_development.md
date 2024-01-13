# 自定义组件

组件（Component）是一个可复用与多框架的模块包，一般用于几种场景：

- 1、包装往下游调用的代码，包裹三方模块简化使用，比如 orm（数据库调用），swagger（简化使用） 等
- 2、可复用的业务逻辑，比如抽象出来的公共 Controller，Service 等

组件可以本地加载，也可以打包到一起发布成一个 npm 包。组件可以在 midway v3/Serverless 中使用。你可以将复用的业务代码，或者功能模块都放到组件中进行维护。几乎所有的 Midway 通用能力都可以在组件中使用，包括但不限于配置，生命周期，控制器，拦截器等。

设计组件的时候尽可能的面向所有的上层框架场景，所以我们尽可能只依赖 `@midwayjs/core` 。

从 v3 开始，框架（Framework）也变为组件的一部分，使用方式和组件保持统一。



## 开发组件

### 脚手架

只需执行下面的脚本，模板列表中选择 `component-v3` 模板，即可快速生成示例组件。

```bash
$ npm init midway
```

注意 [Node.js 环境要求](/docs/intro#环境准备工作)。



### 组件目录

组件的结构和 midway 的推荐目录结构一样，组件的目录结构没有特别明确的规范，和应用或者函数保持一致即可。简单的理解，组件就是一个 “迷你应用"。

一个推荐的组件目录结构如下。

```
.
├── package.json
├── src
│   ├── index.ts			 					// 入口导出文件
│   ├── configuration.ts			 	// 组件行为配置
│   └── service                	// 逻辑代码
│       └── bookService.ts
├── test
├── index.d.ts                  // 组件扩展定义
└── tsconfig.json
```

对于组件来说，唯一的规范是入口导出的 `Configuration` 属性，其必须是一个带有 `@Configuration` 装饰器的 Class。

一般来说，我们的代码为 TypeScript 标准目录结构，和 Midway 体系相同。

同时，又是一个普通的 Node.js 包，需要使用 `src/index.ts` 文件作为入口导出内容。

下面，我们以一个非常简单的示例来演示如何编写一个组件。



### 组件生命周期

和应用相同，组件也使用 `src/configuration.ts` 作为入口启动文件（或者说，应用就是一个大组件）。

其中的代码和应用完全相同。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'book'
})
export class BookConfiguration {
  async onReady() {
    // ...
  }
}
```

唯一不同的是，你需要加一个 `namespace` 作为组件的命名空间。

每个组件的代码是一个独立的作用域，这样即使导出同名的类，也不会和其他组件冲突。

和整个 Midway 通用的 [生命周期扩展](lifecycle) 能力相同。



### 组件逻辑代码

和应用相同，编写类导出即可，由依赖注入容器负责管理和加载。

```typescript
// src/service/book.service.ts
import { Provide } from '@midwayjs/core';

@Provide()
export class BookService {
  async getBookById() {
    return {
      data: 'hello world',
    }
  }
}
```

:::info
一个组件不会依赖明确的上层框架，为了达到在不同场景复用的目的，只会依赖通用的 `@midwayjs/core`。
:::



### 组件配置

配置和应用相同，参考 [多环境配置](env_config)。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
  namespace: 'book',
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig
    }
  ]
})
export class BookConfiguration {
  async onReady() {
    // ...
  }
}
```

在 v3 有一个重要的特性，组件在加载后，`MidwayConfig` 定义中就会包含该组件配置的定义。

为此，我们需要独立编写配置的定义。

在根目录下的 `index.d.ts` 中增加配置定义。

```typescript
// 由于修改了默认的类型导出位置，需要额外导出 dist 下的类型
export * from './dist/index';

// 标准的扩展声明
declare module '@midwayjs/core/dist/interface' {

  // 将配置合并到 MidwayConfig 中
  interface MidwayConfig {
    book?: {
      // ...
    };
  }
}

```

同时，组件的 `package.json` 也有对应的修改。

```json
{
  "name": "****",
  "main": "dist/index.js",
  "typings": "index.d.ts",			// 这里的类型导出文件使用项目根目录的
  // ...
  "files": [
    "dist/**/*.js",
    "dist/**/*.d.ts",
    "index.d.ts"								// 发布时需要额外带上这个文件
  ],
}
```



### 组件约定

组件和应用本身略微有些不同，差异主要在以下几个方面。

- 1、组件的代码需要导出一个 `Configuration` 属性，其必须是一个带有 `@Configuration` 装饰器的 Class，用于配置组件自身能力
- 2、所有 **显式导出的代码 **才会被依赖注入容器加载，简单来说，所有 **被装饰器装饰** 的类都需要导出，包括控制器，服务，中间件等等

比如：

```typescript
// src/index.ts
export { BookConfiguration as Configuration } from './configuration';
export * from './service/book.service';
```

:::info
这样项目中只有  `service/book.service.ts` 这个文件才会被依赖注入容器扫描和加载。
:::

以及在 `package.json` 中指定 main 路径。

```typescript
"main": "dist/index"
```

这样组件就可以被上层场景依赖加载了。



### 测试组件

测试单独某个服务，可以通过启动一个空的业务，指定当前组件来执行。

```typescript
import { createLightApp } from '@midwayjs/mock';
import * as custom from '../src';

describe('/test/index.test.ts', () => {
  it('test component', async () => {
    const app = await createLightApp('', {
      imports: [
        custom
      ]
    });
    const bookService = await app.getApplicationContext().getAsync(custom.BookService);
    expect(await bookService.getBookById()).toEqual('hello world');
  });
});

```

如果组件是 Http 协议流程中的一部分，强依赖 context，必须依赖某个 Http 框架，那么，请使用一个完整的项目示例，使用 `createApp` 来测试。

```typescript
import { createApp, createHttpRequest } from '@midwayjs/mock';
import * as custom from '../src';

describe('/test/index.test.ts', () => {
  it('test component', async () => {
    // 在示例项目中，需要自行依赖 @midwayjs/koa 或其他对等框架
    const app = await createApp(join(__dirname, 'fixtures/base-app'), {
      imports: [
        custom
      ]
    });

    const result = await createHttpRequest(app).get('/');
    // ...

  });
});


```



### 依赖其他组件

如果组件依赖另一个组件中的类，和应用相同，需要在入口处声明，框架会按照模块顺序加载并处理重复的情况。

如果明确依赖某个组件中的类，那么必然是该组件的强依赖。

比如：

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as axios from '@midwayjs/axios';

@Configuration({
  namespace: 'book',
  imports: [axios]
})
export class BookConfiguration {
  async onReady() {
    // ...
  }
}
```

还有一种弱依赖的情况，无需显式声明，但是需要额外的判断。

```typescript
// src/configuration.ts
import { Configuration, IMidwayContainer } from '@midwayjs/core';

@Configuration({
  namespace: 'book',
})
export class BookConfiguration {
  async onReady(container: IMidwayContainer) {
    // ...
    if (container.hasNamespace('axios')) {
      // 当 axios 组件被加载时才执行
    }
    // ...
  }
}
```

增加依赖。

```json
// package.json
{
  "dependencies": {
    "@midwayjs/axios": "xxxx"
  }
}
```

在根目录下的 `index.d.ts` 中增加显式导入依赖的组件定义。

```typescript
// 显式导入依赖的组件
import '@midwayjs/axios';
export * from './dist/index';

// ...

```

:::tip

如果主应用不显式依赖 axios，代码执行是正常的，但是 typescript 的 axios 的定义不会被扫描到，导致编写配置时没有 axios 定义，上述代码可以解决这个问题。

:::


### 应用中开发组件

推荐使用 [lerna](https://github.com/lerna/lerna)，以及开启 lerna 的 hoist 模式来编写组件。如果想在非 lerna 的场景场景下开发组件，请保证组件在 `src` 目录下，否则会出现加载失败的情况。

#### 使用 lerna

使用 lerna 开发相对比较简单，具体的目录结构类似如下。

```
.
├── src
├── packages/
│    ├── component-A
│    │   └── package.json
│    ├── component-B
│    │   └── package.json
│    ├── component-C
│    │   └── package.json
│    └── web
│        └── package.json
├── lerna.json
└── package.json
```

#### 非 lerna

下面是一种常见的组件开发方式，示例结构为在应用代码开发时同时开发两个组件，当然，你也可以自定义你喜欢的目录结构。

```
.
├── package.json
├── src																				 	// 源码目录
│   ├── components
│   │   ├── book                								// book 组件代码
│   │   │    ├── src
│   │   │    │   ├── service
│   │   │    │   │   └── bookService.ts
│   │   │    │   ├── configuration.ts
│   │   │    │   └── index.ts
│   │   │    └── package.json
│   │   │
│   │   └── school
│   │        ├── src
│   │        │   ├── service                		// school 组件代码
│   │        │   │    └── schoolService.ts
│   │        │   └── configuration.ts
│   │        └── package.json
│   │
│   ├── configuration.ts			 // 应用行为配置文件
│   └── controller             // 应用路由目录
├── test
└── tsconfig.json
```

组件行为配置。

```typescript
// src/components/book/src/bookConfiguration.ts
import { Configuration } from '@midwayjs/core';

@Configuration()
export class BookConfiguration {}
```

为了让组件能导出，我们需要在组件的入口 `src/components/book/src/index.ts` 导出 `Configuration` 属性。

```typescript
// src/components/book/src/index.ts
export { BookConfiguration as Configuration } from './bookConfiguration/src`;

```

:::info
注意，这里引用的地方是 "./xxxx/src"，是因为一般我们 package.json 中的 main 字段指向了 dist/index，如果希望代码不修改，那么 main 字段要指向 src/index，且在发布时记得修改回 dist。

将组件引入的目录指向 src ，是为了能在保存是自动生效（重启）。
:::

另外，在新版本可能会出现扫描冲突的问题。可以将 `configuration.ts` 中的依赖注入冲突检查功能关闭。



### 使用组件

在任意的 midway 系列的应用中，可以通过同样的方式引入这个组件。

首先，在应用中加入依赖。

```json
// package.json
{
  "dependencies": {
    "midway-component-book": "*"
  }
}
```

然后，在应用（函数）中引入这个组件。

```typescript
// 应用或者函数的 src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as book from 'midway-component-book';

@Configuration({
  imports: [book],
})
export class MainConfiguration {}
```

至此，我们的准备工作就做完了，下面开始使用。

直接引入组件的类注入。

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { BookService } from 'midway-component-book';

@Provide()
export class Library {

  @Inject();
  bookService: BookService;

}
```

其余如果组件有包含特定的能力，请参考组件本身的文档。



### 组件发布

组件就是一个普通 Node.js 包，编译后发布到 npm 分发即可。

```bash
## 编译并发布对应的component
$ npm run build && npm publish
```



### 组件示例

[这里](https://github.com/czy88840616/midway-test-component) 有一个组件示例。已经发布到 npm，可以尝试直接引入到项目中启动执行。



## 开发框架（Framework）

在 v3 中，组件可以包含一个 Framework，来提供不同的服务，利用生命周期，我们可以扩展提供  gRPC，Http 等协议。

这里的 Framework 只是组件里的一个特殊业务逻辑文件。

比如：

```
.
├── package.json
├── src
│   ├── index.ts			 					// 入口导出文件
│   ├── configuration.ts			 	// 组件行为配置
│   └── framework.ts            // 框架代码
│
├── test
├── index.d.ts                  // 组件扩展定义
└── tsconfig.json
```





### 扩展现有 Framework

上面提到，Framework 是组件的一部分，同时也遵循组件规范，是可以注入以及扩展的。

我们以扩展 `@midwayjs/koa` 举例。

首先创建一个自定义组件，和普通应用相同，由于需要扩展 `@midwayjs/koa` ，那么在组件中，我们需要依赖 `@midwayjs/koa` 。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  namespace: 'myKoa',
  imports: [koa]
})
export class MyKoaConfiguration {
  async onReady() {
    // ...
  }
}
```

随后，我们就可以注入 `@midwayjs/koa` 导出的 Framework，来做扩展了。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  namespace: 'myKoa',
  imports: [koa]
})
export class MyKoaConfiguration {
  @Inject()
  framework: koa.Framework;

  async onReady() {
    // 添加中间件，koa 中的 app.useMiddleware 其实代理了 framework 上的方法
    this.framework.useMiddleware(/* ... */);

    // 添加过滤器，koa 中的 app.useFilter 其实代理了 framework 上的方法
    this.framework.useFilter(/* ... */);

    // koa 自身的扩展能力，比如扩展 context
    const app = this.framework.getApplication();
    Object.defineProperty(app.context, 'user', {
      get() {
        // ...
        return 'xxx';
      },
      enumerable: true,
    });
    // ...
  }

  async onServerReady() {
    const server = this.framework.getServer();
    // server.xxxx
  }
}
```

这是一种基于现有 Framework 去扩展的一种方法。

- 如果组件中扩展了 context，那么请参考 [扩展上下文定义](./context_definition)
- 如果组件中扩展了配置，那么请参考 [组件配置](#组件配置)

等组件发布后，比如叫 `@midwayjs/my-koa`，业务可以直接使用你的组件，而无需引入 `@midwayjs/koa` 。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
// 你自己的组件
import * as myKoa from '@midwayjs/my-koa';

@Configuration({
  imports: [myKoa],
})
export class MyConfiguration {
  async onReady() {
    // ...
  }
}
```

如果希望完全定义自己的组件，比如不同的协议，就需要完整自定义 Framework。



### 编写 Framework

框架都遵循 `IMidwayFramewok` 的接口定义，以及如下约定。

- 每个框架有要自定义独立的启停流程
- 每个框架需要定义自己独立的 `Application` ，`Context`
- 每个框架可以有自己独立的中间件能力

为了简化开发，Midway 提供了一个基础的 `BaseFramework` 类供继承。

```typescript
import { Framework, BaseFramework, IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';

// 定义 Context
export interface Context extends IMidwayContext {
  // ...
}

// 定义 Application
export interface Application extends IMidwayApplication<Context> {
  // ...
}

// 框架的配置
export interface IMidwayCustomConfigurationOptions extends IConfigurationOptions {
	// ...
}

// 实现一个自定义框架，继承基础框架
@Framework()
export class MidwayCustomFramework extends BaseFramework<Application, Context, IMidwayCustomConfigurationOptions> {

  // 处理初始化配置
  configure() {
    // ...
  }

  // app 初始化
  async applicationInitialize() {
    // ...
  }

  // 框架启动，比如 listen
  async run() {
    // ...
  }
}
```



### 自定义示例

接下去我们会以实现一个基础的 HTTP 服务框架作为示例。

```typescript
import { BaseFramework, IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as http from 'http';

// 定义一些上层业务要使用的定义
export interface Context extends IMidwayContext {}

export interface Application extends IMidwayApplication<Context> {}

export interface IMidwayCustomConfigurationOptions extends IConfigurationOptions {
  port: number;
}

// 实现一个自定义框架，继承基础框架
export class MidwayCustomHTTPFramework extends BaseFramework<Application, Context, IMidwayCustomConfigurationOptions> {

  configure(): IMidwayCustomConfigurationOptions {
    return this.configService.getConfiguration('customKey');
  }

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
        this.app.listen(this.configurationOptions.port, () => {
          resolve();
        });
      });
    }
  }
}
```

我们定义了一个 `MidwayCustomHTTPFramework` 类，继承了 `BaseFramework` ，同时实现了 `applicationInitialize` 和 `run` 方法。

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
