<p align="center">
  <a href="https://midwayjs.org/" target="blank"><img src="https://img.alicdn.com/imgextra/i1/O1CN01xQLU011T2R7PHksIv_!!6000000002324-2-tps-1200-616.png" width="1000" alt="Midway Logo" /></a>
</p>

<p align="center">Midway - 更具生产力的 <a href="http://nodejs.org" target="_blank">Node.js</a> 框架。</p>
<p align="center">
    <a href="https://github.com/midwayjs/midway/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license" /></a>
    <a href=""><img src="https://img.shields.io/github/tag/midwayjs/midway.svg" alt="GitHub tag"></a>
    <a href="https://travis-ci.org/midwayjs/midway"><img src="https://travis-ci.org/midwayjs/midway.svg?branch=develop" alt="Build Status"></a>
    <a href="https://codecov.io/gh/midwayjs/midway/branch/master"><img src="https://img.shields.io/codecov/c/github/midwayjs/midway/master.svg" alt="Test Coverage"></a>
    <a href="https://lernajs.io/"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg" alt="lerna"></a>
    <a href="https://snyk.io/test/npm/midway"><img src="https://snyk.io/test/npm/midway/badge.svg" alt="Known Vulnerabilities"></a>
    <a href="https://github.com/midwayjs/midway/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="https://www.codacy.com/app/czy88840616/midway?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=midwayjs/midway&amp;utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/856737478fa94e78bce39d5fc2315cec" alt="Codacy Badge"></a>
    <a href="#backers"><img src="https://opencollective.com/midway/backers/badge.svg" alt="Backers on Open Collective"></a> <a href="#sponsors"><img src="https://opencollective.com/midway/sponsors/badge.svg" alt="Sponsors on Open Collective"></a>
    <a href="https://gitpod.io/#https://github.com/midwayjs/midway"><img src="https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod" alt="Gitpod Ready-to-Code"></a>
    <a href="https://github.com/midwayjs/mwts"><img src="https://img.shields.io/badge/code%20style-midwayjs-brightgreen.svg" alt="Code Style: MidwayJS"></a>
</p>

[English](./README.en-US.md) | 简体中文

## 特性

- [x] **全功能**：支持 Web 应用/Serverless/微服务/小程序后端等多种场景
- [x] **前端集成**：全新的应用研发体验，通过 全栈 | 函数式 | 使用 "React Hooks" 开发前后端一体化应用
- [x] **跨平台**：支持部署至 Server 或 Serverless
- [x] **插件**：支持使用 Koa/Express/Egg.js 生态插件
- [x] **示例**: 官方提供多种 Node 场景的示例代码，方便开发者快速上手

## 描述

Midway 是一个适用于构建 Serverless 服务，传统应用、微服务，小程序后端的 Node.js 框架。

Midway 可以使用 Koa，Express 或 Egg.js 作为基础 Web 框架。它还提供了独立使用的基本解决方案，例如 Socket.io，GRPC，Dubbo.js 和 RabbitMQ 等。

此外，Midway 也适用于前端/全栈开发人员的 Node.js 无服务器框架。构建下一个十年的应用程序。可在 AWS，阿里云，腾讯云和传统 VM /容器上运行。与 React 和 Vue 轻松集成。 🌈

## Demo

### 使用装饰器开发 Web 应用

```ts
import { Controller, Get, Provide } from 'midway';

@Provide()
@Controller('/')
export class HomeController {

  @Get('/')
  async index(ctx) {
    ctx.body = `Welcome to midwayjs!`;
  }
}
```

### 使用函数开发全栈应用

> 后端代码
> src/apis/lambda/index.ts

```typescript
import { useContext } from '@midwayjs/hooks'

export async function getPath() {
  // 获取请求 HTTP Context
  const ctx = useContext()
  return ctx.path
}
```

> 前端调用
> src/page/index.tsx

```typescript
import { getPath } from './apis/lambda'

getPath().then((path) => {
  // 发送 GET 请求到 /api/getPath
  // 返回值: /api/getPath
  console.log(path)
})
```

## 快速上手

```bash
npm i @midwayjs/cli -g --registry=https://registry.npm.taobao.org

## 创建项目
mw new helloworld

## 进入项目路径
cd helloworld && npm run dev
```

你也可以在阿里云官网知行实验室，学习 Midway [相关的课程](https://start.aliyun.com/handson-lab)。

## 文档和社区

![](https://img.alicdn.com/imgextra/i2/O1CN01LCCXpo1ZXw3Ee0TDk_!!6000000003205-0-tps-3336-1390.jpg)

- [官网](https://midwayjs.org)
- 要查看 v2 中文文档, 请访问 [中文文档](https://www.yuque.com/midwayjs/midway_v2) 📚
- 要查看 v1 中文文档, 请访问 [中文文档](https://www.yuque.com/midwayjs/midway_v1) 📚

## 示例

![midway-examples](https://img.alicdn.com/imgextra/i1/O1CN01Q0M4Ma27FnIgiXE4a_!!6000000007768-0-tps-3802-1996.jpg)

请访问 [midway-examples](http://demo.midwayjs.org/).

## VSC Plugin

![](https://camo.githubusercontent.com/7819739b6a9eb3d673124817b0d40e46dc963993/68747470733a2f2f63646e2e6e6c61726b2e636f6d2f79757175652f302f323032302f6769662f3530313430382f313539333636313634363431362d35636238663637392d336331302d343638392d386465612d6530313731326438653231662e67696623616c69676e3d6c65667426646973706c61793d696e6c696e65266865696768743d383731266d617267696e3d2535426f626a6563742532304f626a656374253544266e616d653d323032302d30372d303225323031312d34342d32382e323032302d30372d303225323031315f34365f34302e676966266f726967696e4865696768743d383731266f726967696e57696474683d313036302673697a653d373438353839267374617475733d646f6e65267374796c653d6e6f6e652677696474683d31303630)

## 答疑

群里会有热心的朋友，也会有新版本发布推送。钉钉扫码加入答疑群


二群

![](https://img.alicdn.com/imgextra/i3/O1CN01GY6N6x1Sylx7mjGyf_!!6000000002316-2-tps-314-402.png)


一群（已满）

![](https://img.alicdn.com/imgextra/i2/O1CN01ofEEAL2AEpJHbpse5_!!6000000008172-2-tps-311-401.png)

## 贡献

请告知我们可以为你做些什么，不过在此之前，请检查一下是否有 [已经存在的Bug或者意见](http://github.com/midwayjs/midway/issues)。

如果你是一个代码贡献者，请参考代码贡献规范。

## License

我们的代码使用 [MIT](http://github.com/midwayjs/midway/blob/master/LICENSE) 协议，请放心使用。

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmidwayjs%2Fmidway.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmidwayjs%2Fmidway?ref=badge_large)
