---
title: 介绍
---

Midway Hooks 是函数式全栈框架，支持四大核心特性："零" Api & 类型安全 & 全栈套件 & 强大后端。

## 特性介绍

### 零 Api

在 Midway Hooks 全栈应用中开发的后端接口函数，可以直接导入并调用，无需前后端手写 Ajax 胶水层。以下是一个简单的例子：

后端代码：

```ts
import {
  Api,
  Post,
} from '@midwayjs/hooks';

export default Api(
  Post(), // Http Path: /api/say,
  async (name: string) => {
    return `Hello ${name}!`;
  }
);
```

前端调用：

```ts
import say from './api';

const response = await say('Midway');
console.log(response); // Hello Midway!
```

### 类型安全与运行时安全

使用 `@midwayjs/hooks` 提供的 [Validate](./validate.md) 校验器，可以实现从前端到后端的类型安全 + 运行时安全链路。以下是一个简单的例子：

后端代码：

```ts
import {
  Api,
  Post,
  Validate,
} from '@midwayjs/hooks';
import { z } from 'zod';

export default Api(
  Post('/hello'),
  Validate(z.string(), z.number()),
  async (name: string, age: number) => {
    return `Hello ${name}, you are ${age} years old.`;
  }
);
```

一体化调用：

```ts
import hello from './api';

try {
  await hello(null, null);
} catch (error) {
  console.log(error.message); // 'name must be a string'
  console.log(error.status); // 422
}
```

整个过程中。

- 前端：基于类型，静态校验输入参数，并获取类型提示
- 后端：校验前端传入参数
- 数据库等业务逻辑：使用正确的数据

通过这种方式，我们可以低成本的实现静态类型安全 + 运行时安全。

### 全栈套件

在 Midway Hooks 中，我们提供了 `@midwayjs/hooks-kit` 来快速开发全栈应用。

你可以通过 `hooks dev` 来启动全栈应用，`hooks build` 来打包全栈应用，同时在服务端你也可以使用 `hooks start` 一键启动应用。

解决你在使用全栈应用时的后顾之忧。

### 强大后端

Midway Hooks 基于 Midway 开发。

Midway 是一个有着 8 年历史的 Node.js 框架，具有强大的后端功能，包含 Cache / Redis / Mongodb / Task / Config 等 Web 下常用的组件。

而这些你在使用 Midway Hooks 时都可以无缝享受到。

## 创建应用

Midway Hooks 目前提供了如下模板：

- 全栈应用
  - [react](https://github.com/midwayjs/hooks/blob/main/examples/react)
  - [vue](https://github.com/midwayjs/hooks/blob/main/examples/vue)
  - [prisma](https://github.com/midwayjs/hooks/blob/main/examples/prisma)
- Api Server
  - [api](https://github.com/midwayjs/hooks/blob/main/examples/api)

基于指定创建应用命令如下：

```bash
npx degit https://github.com/midwayjs/hooks/examples/<name>
```

创建 react 模版的全栈应用命令如下：

```bash
npx degit https://github.com/midwayjs/hooks/examples/react ./hooks-app
```

创建 api 模版的应用命令如下：

```bash
npx degit https://github.com/midwayjs/hooks/examples/api ./hooks-app
```

## 下一步

- 了解如何开发接口并提供给前端调用：[接口开发](./api.md)
- 如何使用和创建可复用的 Hooks：[Hooks](./builtin-hooks.md)
- 如何在运行时校验用户参数：[校验器](./validate.md)
