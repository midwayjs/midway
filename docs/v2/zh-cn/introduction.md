---
title: 介绍
---

Midway 是阿里巴巴 - 淘宝前端架构团队，基于渐进式理念研发的 Node.js 框架。
​

Midway 基于 TypeScript 开发，结合了`面向对象（OOP + Class + IoC）`与`函数式（FP + Function + Hooks）`两种编程范式，并在此之上支持了 Web / 全栈 / 微服务 / RPC / Socket / Serverless 等多种场景，致力于为用户提供简单、易用、可靠的 Node.js 服务端研发体验

## 为什么要有 Midway

社区上也有很多类似的框架，那为什么还需要 Midway ？
​

原因有三点
​

1. Midway 是阿里内部一直持续在研发的框架，之前 egg 是作为底层框架，需要有面向应用层面的框架来和集团场景对接
1. 全量使用 TypeScript 是未来一段时间的趋势，面向未来去迭代和研发是作为架构组创新的要求
1. 虽然社区已经有 nest 这样的框架，但是这些产品的维护、协作、修改都会受到商业化产品的制约，也无法做到需求的快速迭代和安全性保障，整体的研发理念也和我们不同，为此，我们需要有一套自研的框架体系

​

## 我们的优势

1. Midway 框架是在内部已经使用 5 年以上的 Node.js 框架，有着长期投入和持续维护的团队做后盾。
1. 已经在每年的大促场景经过考验，稳定性无须担心
1. 丰富的组件和扩展能力，例如数据库，缓存，定时任务，进程模型，部署以及 Web，Socket 甚至 Serverless 等新场景的支持
1. 一体化调用方案可以方便快捷和前端页面协同开发
1. 良好的 TypeScript 定义支持
1. 国产化文档和沟通容易简单

## 多编程范式

Midway 支持面向对象与函数式两种编程范式，你可以根据实际研发的需要，选择不同的编程范式来开发应用。

### 面向对象（OOP + Class + IoC）

Midway 支持面向对象的编程范式，为应用提供更优雅的架构。
​

下面是基于面向对象，开发路由的示例。

```typescript
// src/controller/home.ts
import { Controller, Get, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    return {
      message: 'Hello Midwayjs!',
      query: this.ctx.ip,
    };
  }
}
```

​

### 函数式（FP + Function + Hooks）

Midway 也支持函数式的编程范式，为应用提供更高的研发效率。
​

下面是基于函数式，开发路由接口的示例。

```typescript
// src/api/index.ts

import { useContext } from '@midwayjs/hooks';
import { Context } from '@midwayjs/koa';

export default async function home() {
  const ctx = useContext<Context>();

  return {
    message: 'Hello Midwayjs!',
    query: ctx.ip,
  };
}
```

## 准备工作

Midway 运行请预先安装 Node.js 环境和 npm，在国内可以使用 cnpm。

- 操作系统：支持 macOS，Linux，Windows
- 运行环境：建议选择 [LTS 版本](http://nodejs.org/)，最低要求 12.x。

如果需要帮助，请参考 [如何安装 Node.js 环境](how_to_install_nodejs)。

## 正确的提问

- ❌ 在 yuque 评论区提问
- ✅ 在 [github issue](https://github.com/midwayjs/midway/issues) 提问，可追踪，可沉淀，可 Star
  - 1、描述你的问题，提供尽可能详细的复现方法，框架版本，场景（Serverless 还是应用）
  - 2、尽可能提供报错截图，堆栈信息，最小复现的 repo

## 答疑分享群

群里会有热心的朋友，也会有新版本发布推送。

钉钉扫码加入答疑群（申请加入，自动通过）。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1615263665400-68443564-4725-4496-90fb-c8d245239a1c.png#height=391&id=moZdJ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1644&originWidth=1284&originalType=binary&ratio=1&size=690037&status=done&style=none&width=305" width="305" />

微信由于微信群限制，可以先加拉群小助手（备注 midway 加群），然后拉到微信群。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1605583123587-9d2eb106-f3b5-42d8-87d9-e5bdeb7b04e2.png#height=379&id=EhDVT&margin=%5Bobject%20Object%5D&name=image.png&originHeight=618&originWidth=460&originalType=binary&ratio=1&size=121176&status=done&style=none&width=282" width="282" />
