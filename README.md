<p align="center">
  <a href="https://midwayjs.org/" target="blank"><img src="https://img.alicdn.com/imgextra/i1/O1CN01xQLU011T2R7PHksIv_!!6000000002324-2-tps-1200-616.png" width="1000" alt="Midway Logo" /></a>
</p>

<p align="center">Midway - 一个面向未来的云端一体 <a href="http://nodejs.org" target="_blank">Node.js</a> 框架</p>
<p align="center">
    <a href="https://github.com/midwayjs/midway/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license" /></a>
    <a href=""><img src="https://img.shields.io/github/tag/midwayjs/midway.svg" alt="GitHub tag"></a>
    <a href="#"><img src="https://github.com/midwayjs/midway/actions/workflows/nodejs.yml/badge.svg?branch=2.x" alt="Build Status"></a>
    <a href="https://codecov.io/gh/midwayjs/midway/branch/master"><img src="https://img.shields.io/codecov/c/github/midwayjs/midway/master.svg" alt="Test Coverage"></a>
    <a href="https://lernajs.io/"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg" alt="lerna"></a>
    <a href="https://github.com/midwayjs/midway/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="https://gitpod.io/#https://github.com/midwayjs/midway"><img src="https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod" alt="Gitpod Ready-to-Code"></a>
    <a href="https://github.com/midwayjs/mwts"><img src="https://img.shields.io/badge/code%20style-midwayjs-brightgreen.svg" alt="Code Style: MidwayJS"></a>
</p>

[English](./README.en-US.md) | 简体中文


## 资源

- [2022 夏季 mini 直面会](https://www.bilibili.com/video/BV1QB4y1q7Qs)
- [2022 冬季直面会](https://www.bilibili.com/video/BV1W44y1s7dj?spm_id_from=333.999.0.0)
- [3.x beta 功能预览](https://www.bilibili.com/video/BV1aL4y1p7oA?from=search&seid=8235946720906913847&spm_id_from=333.337.0.0)
- [2021 秋季直面会](https://www.bilibili.com/video/BV1Ng411T76f?from=search&seid=8235946720906913847&spm_id_from=333.337.0.0)
- [2021 夏季直面会](https://www.bilibili.com/video/BV1nF411a7sr?from=search&seid=8235946720906913847&spm_id_from=333.337.0.0)
- [v2 示例教程](https://www.bilibili.com/video/BV1254y1E73m?from=search&seid=8235946720906913847&spm_id_from=333.337.0.0)
- [2.0 发布会回放](https://www.bilibili.com/video/BV17A411T7Md)[《2.0 发布会文章》](https://zhuanlan.zhihu.com/p/355768659)

## 特性

- 🐘 **全功能**：支持 Web 应用/Serverless/FaaS/微服务/小程序后端等多种场景，基于装饰器和依赖注入开发企业级应用
- 🐦 **前端集成**：全新的云端一体应用研发体验，零 API 调用，使用 "React Hooks " 风格一体研发
- 🐴 **跨平台**：支持部署至普通 Server 或 Serverless/FaaS 环境
- 🐶 **扩展**：组件化扩展能力，另外支持使用 Koa/Express/Egg.js 生态插件
- 🐂 **示例**: 官方提供多种场景的示例代码，方便开发者快速上手
- 🛡 TypeScript 全面支持

## 描述

Midway 是一个适用于构建 Serverless 服务，传统应用、微服务，小程序后端的 Node.js 框架。

Midway 可以使用 Koa，Express 或 Egg.js 作为基础 Web 框架。它还提供了独立使用的基本解决方案，例如 Socket.io，GRPC，Dubbo.js 和 RabbitMQ 等。

此外，Midway 也适用于前端/全栈开发人员的 Node.js 无服务器框架。构建下一个十年的应用程序。可在 AWS，阿里云，腾讯云和传统 VM /容器上运行。与 React 和 Vue 轻松集成。 🌈

## Demo

### 使用装饰器开发 Web 应用

```ts
import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class HomeController {

  @Get('/')
  async home() {
    return `Welcome to midwayjs!`;
  }
}
```

### 使用函数开发全栈应用

> 后端代码
> src/apis/lambda/index.ts

```typescript
import {
  Api,
  Get,
  Query,
  useContext,
} from '@midwayjs/hooks';

export default Api(
  Get(),
  Query<{
    page: string;
    limit: string;
  }>(),
  async () => {
    const ctx = useContext();
    return {
      page: ctx.query.page,
      limit: ctx.query.limit,
    };
  }
);
```

> 前端调用
> src/page/index.tsx

```typescript
import getArticles from './api';
const response = await getArticles({
  query: { page: '0', limit: '10' },
});
console.log(response); // { page: '0', limit: '10' }
```

> 手动调用

```typescript
fetch('/api/articles?page=0&limit=10')
  .then((res) => res.json())
  .then((res) => console.log(res)); // { page: '0', limit: '10' }
```

## 快速上手

```bash
$ npm -v

# 如果是 npm v6
$ npm init midway --type=web my_midway_app

# 如果是 npm v7
$ npm init midway -- --type=web my_midway_app

## 进入项目路径
cd my_midway_app && npm run dev
```

## 文档和社区

- [官网](https://midwayjs.org)
- [备用官网](https://beta.midwayjs.org)

## 官方示例

![midway-examples](https://img.alicdn.com/imgextra/i1/O1CN01Q0M4Ma27FnIgiXE4a_!!6000000007768-0-tps-3802-1996.jpg)

请访问 [midway-examples](http://demo.midwayjs.org/)


## 社区优秀示例展示

**1、Cool-Admin - 一个很酷的后台权限管理框架**

![image](https://user-images.githubusercontent.com/418820/118931341-73ce1880-b979-11eb-90c6-1758762ce338.png)

- 官网：https://cool-js.com/



## VSC Plugin

![](https://camo.githubusercontent.com/7819739b6a9eb3d673124817b0d40e46dc963993/68747470733a2f2f63646e2e6e6c61726b2e636f6d2f79757175652f302f323032302f6769662f3530313430382f313539333636313634363431362d35636238663637392d336331302d343638392d386465612d6530313731326438653231662e67696623616c69676e3d6c65667426646973706c61793d696e6c696e65266865696768743d383731266d617267696e3d2535426f626a6563742532304f626a656374253544266e616d653d323032302d30372d303225323031312d34342d32382e323032302d30372d303225323031315f34365f34302e676966266f726967696e4865696768743d383731266f726967696e57696474683d313036302673697a653d373438353839267374617475733d646f6e65267374796c653d6e6f6e652677696474683d31303630)

## 答疑

群里会有热心的朋友，也会有新版本发布推送。

![](https://img.alicdn.com/imgextra/i3/O1CN01F2EYhK1t290OXO4am_!!6000000005843-0-tps-3916-3220.jpg)

## 贡献

<a href="https://github.com/midwayjs/midway/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=midwayjs/midway" />
</a>

请告知我们可以为你做些什么，不过在此之前，请检查一下是否有 [已经存在的Bug或者意见](http://github.com/midwayjs/midway/issues)。

如果你是一个代码贡献者，请参考代码贡献规范。

## 谁在使用

![image](https://user-images.githubusercontent.com/629202/110743837-a968ce00-8273-11eb-8284-f5749335fe70.png)
你也想加 Logo ？可以点击 [这里](https://github.com/midwayjs/midway/issues/898) 添加。

## License

我们的代码使用 [MIT](http://github.com/midwayjs/midway/blob/master/LICENSE) 协议，请放心使用。

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmidwayjs%2Fmidway.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmidwayjs%2Fmidway?ref=badge_large)
