---
title: 组件开发
---

组件（Component）是一个可复用与多框架的模块包，一般用于几种场景：

- 1、包装往下游调用的代码，包裹三方模块简化使用，比如 orm（数据库调用），swagger（简化使用） 等
- 2、可复用的业务逻辑，比如抽象出来的公共 Controller，Service 等

组件可以本地加载，也可以打包到一起发布成一个  npm 包。组件可以在 midway v2/Serverless 中使用。你可以将复用的业务代码，或者功能模块都放到组件中进行维护。几乎所有的 Midway 通用能力都可以在组件中使用，包括但不限于配置，生命周期，控制器，拦截器等。

设计组件的时候尽可能的面向所有的上层框架场景，所以我们尽可能只依赖 `@midwayjs/core` 和 `@midwayjs/decorator` 。

## 脚手架

初始化脚手架例子：

```bash
# 如果是 npm v6
$ npm init midway --type=component hello2

# 如果是 npm v7
$ npm init midway -- --type=component hello2

$ cd hello2
```

然后组件开发，并发布。

```bash
$ npm run build && npm publish // 编译并发布对应的component
```

## 组件目录

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
└── tsconfig.json
```

对于组件来说，唯一的规范是入口导出的 `Configuration`  属性，其必须是一个带有 `@Configuration`  装饰器的 Class。

一般来说，我们的代码为 TypeScript 标准目录结构，和 Midway 体系相同。不同的是，由于是一个额外的包，需要使用 `src/index.ts`  文件作为入口导出内容。

## 组件约定

组件和应用本身略微有些不同，差异主要在以下几个方面。

- 1、组件的代码需要导出一个 `Configuration` 属性，其必须是一个带有 `@Configuration` 装饰器的 Class，用于配置组件自身能力
- 2、所有 **显式导出的代码 **才会被依赖注入容器加载

比如：

```typescript
// src/index.ts
export { AutoConfiguration as Configuration } from './configuration';
export * from './controller/user';
export * from './controller/api';
export * from './service/user';
```

:::info
这样项目中只有 `controller/user` ， `controller/api` ， `service/user` 这三个文件才会被依赖注入容器扫描和加载。
:::

以及在 `package.json`  中指定 main 路径。

```typescript
  "main": "dist/index"
```

这样组件就可以被上层场景依赖加载了。

## 开发组件的方式

我们可以新建一个项目，将它改造为组件，也可以在原有项目中开发，直到组建完成后再发布到独立的仓库。

### 新仓库开发组件

代码结构如下：

```
.
├── src															// 源码目录
│   ├── service
│   │    └── bookService.ts
│   ├── configuration.ts						// 组件行为配置
│   └── index.ts										// 组件导出入口
└── package.json
├── test
└── tsconfig.json
```

组件行为配置。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';

@Configuration()
export class BookConfiguration {}
```

在组件的入口导出 `Configuration` 属性。

```typescript
// src/index.ts
export { BookConfiguration as Configuration } from './configuration`;

```

### 应用中开发组件

推荐使用 [lerna](https://github.com/lerna/lerna)，以及开启 lerna 的 hoist 模式来编写组件。如果想在非 lerna 的场景场景下开发组件，请保证组件在 `src`  目录下，否则会出现加载失败的情况。

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
import { Configuration } from '@midwayjs/decorator';

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

## 开发组件

举一个例子，我们现在要把一个 `BookService` 放到组件中，让其他场景的代码复用。

组件的服务代码如下。

```typescript
// src/service/bookService
import { Provide } from '@midwayjs/decorator';

@Provide()
export class BookService {
  async getBookById(id) {}
}
```

:::info
一个组件不会依赖明确的上层框架，为了达到在不同场景复用的目的，只会依赖通用的 `@midwayjs/core` 和 `@midwayjs/decorator`
:::

组件的 npm 包名为 `midway-component-book` ， `package.json`  如下。

```typescript
{
	"name": "midway-component-book",
  "version": "1.0.0",
  "main": "dist/index",
  "typings": "dist/index.d.ts",
  "files": [
    "dist/**/*.js",
    "dist/**/*.d.ts"
  ],
  "devDependencies": {
    "@midwayjs/core": "^2.3.0",
    "@midwayjs/decorator": "^2.3.0"
  }
  ...
}
```

### 组件作用域（命名空间）

为了避免组件的业务代码和其他的业务代码冲突，组件在导出的时候加入了作用域的概念。默认的作用域为 npm 包名，即 `package.json`  中的 `name`  字段。

可以在 `@Configuration`  装饰器中的 `namespace`  字段修改。
​

> 后续我们将弱化作用域的概念

```typescript
// src/bookConfiguration.ts
import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: 'book',
})
export class BookConfiguration {}
```

引用组件导出的服务时，示例如下。

```typescript
// in project
// 这里直接引入组件包导出的类型
import { BookService } from 'midway-component-book';

@Provide()
@Controller('/user')
export class HomeControlelr {
  @Inject()
  bookService: BookService; // 这里直接注入了 book 这个作用域下的 bookService
}
```

### 组件使用自身服务

#### 1、使用组件自己 `@Provide`  的情况

Midway 使用 `@Inject`  装饰器来注入其他服务，在组件中，只要是同一个组件，我们也可以直接注入，不需要增加作用域前缀。

比如：

```typescript
// src/controller/user.ts
// 这里是组件中的 user 控制器

import { BookService } from './service/bookService';

@Provide()
@Controller('/user')
export class UserController {
  @Inject()
  bookService: BookService; // 这里注入不需要组件前缀，会自动处理

  @Inject('bookService')
  bookService: BookService; // 这里注入不需要组件前缀，会自动处理，和上面行为一致
}
```

所以，组件内部调用组件自己的 `@Provide`  的服务，不需要加作用域前缀。

#### 2、组件使用自己 `registerObject`  的情况

如果在 onReady 的时候注入了三方对象，那么该三方对象将属于组件自身。

```typescript
@Configuration({
  namespace: 'book',
})
export class BookConfiguration {
  async onReady(contanier) {
    contanier.registerObject('aaa', 'bbb'); // 容器内部会绑定到当前的组件
  }
}
```

如果组件内部使用时，可以无需增加前缀。

```typescript
@Provide()
@Controller('/user')
export class UserController {
  @Inject()
  aaa: string; // 这里注入不需要组件前缀，会自动处理
}
```

#### 3、组件使用自己 `providerWrapper`  出来的方法

如果组件需要使用 `providerWrapper`  来暴露方法，请增加 **组件作用域前缀**。

```typescript
import { providerWrapper, IMidwayContainer } from '@midwayjs/core';

export async function contextHandler(container: IMidwayContainer) {}

providerWrapper([
  {
    id: 'book:contextHandler', // 这里务必增加组件前缀
    provider: contextHandler,
    scope: ScopeEnum.Request,
  },
]);
```

组件在使用自己暴露的方法时，可以不需要前缀。

```typescript
@Provide()
@Controller('/user')
export class UserController {
  @Inject()
  contextHandler; // 这里注入不需要组件前缀，会自动处理
}
```

### 组件注入全局对象

Midway 上层框架默认会注入一些 [全局对象](container#stYqU)（框架、业务注入的对象），这些全局对象在组件中使用不需要作用域前缀。

比如在组件中：

```typescript
@Configuration()
export class ContainerLifeCycle {
  @Inject()
  baseDir; // 注入全局对象不需要前缀

  async onReady(container) {
    container.registerObject('aaa', 'bbbb');
  }
}
```

组件的普通逻辑中：

```typescript
@Provide()
export class Home {
  @Inject()
  baseDir: string;

  @Inject()
  aaa; // 当前组件注册的属性不需要前缀

  @Inject()
  ccc; // 全局注入的属性不需要前缀

  async getData() {}
}
```

### 组件业务配置

`@Configuration` 装饰器的 `importConfigs` 属性用于指定配置，这个行为和上层框架通用的[业务配置](/docs/env_config)能力一致。

```typescript
// src/bookConfiguration.ts
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  namespace: 'book',
  importConfigs: [
    join(__dirname, 'config'), // 可以指定整个目录
    join(__dirname, 'anotherConfig/config.default.ts'), // 可以指定单个文件
  ],
})
export class BookConfiguration {}
```

:::info
注意： `importConfigs`  的路径都为绝对路径。
:::

### 组件生命周期

和整个 Midway 通用的 [生命周期扩展](lifecycle) 能力相同。

## 使用组件

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
import { Configuration } from '@midwayjs/decorator';
import * as book from 'midway-component-book';

@Configuration({
  imports: [book],
})
export class ContainerLifeCycle {}
```

至此，我们的准备工作就做完了，下面开始使用。

### 1、外部使用组件 `@Provide`  的类

假如我们在应用（函数）中需要用组件中的类，由于组件配置了命名空间，通过下面的方式即可导入组件中的代码。

直接引入组件的类注入。

```typescript
import { Provide, Inject } from '@midwayjs/decorator';
import { BookService } from 'midway-component-book';

@Provide()
export class Library {

  @Inject();
  bookService: BookService;

}
```

等价于 “通过作用域 + 名字” 注入

```typescript
import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class Library {

  @Inject('book:bookService');
  bookService;

}
```

### 2、外部使用组件 `registerObject`  的对象

如果组件中有使用 `registerObject`  将对象注入到容器，那么该实例是属于此组件的，使用时需要增加前缀。

```typescript
// 组件中
@Configuration({
  namespace: 'book',
})
export class BookConfiguration {
  async onReady(contanier) {
    contanier.registerObject('aaa', 'bbb'); // 容器内部会绑定到当前的组件
  }
}
```

应用（函数 ）代码中使用：

```typescript
import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class Library {

  @Inject('book:aaa');
  aaa: string;

}
```

### 3、外部使用组件 `providerWrapper` 的方法

如果组件导出一个方法。

```typescript
// 组件导出
import { providerWrapper, IMidwayContainer } from '@midwayjs/core';

export async function contextHandler(container: IMidwayContainer) {}

providerWrapper([
  {
    id: 'book:contextHandler', // 这里务必增加组件前缀
    provider: contextHandler,
    scope: ScopeEnum.Request,
  },
]);
```

应用（函数 ）代码中使用：

```typescript
import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class Library {

  @Inject('book:contextHandler');
  contextHandler;

}
```

其余如果组件有包含特定的能力，请参考组件本身的文档。

## 组件示例

[这里](https://github.com/czy88840616/midway-test-component) 有一个组件示例。已经发布到 npm，可以尝试直接引入到项目中启动执行。
