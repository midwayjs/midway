[English](./README.en-US.md) | 简体中文


![](https://img.alicdn.com/tfs/TB1c1utMuT2gK0jSZFvXXXnFXXa-1422-305.png)

<p align="center">
  <a href="https://www.npmjs.com/package/@midwayjs/faas" alt="npm version">
    <img src="https://img.shields.io/npm/v/@midwayjs/faas.svg?style=flat" />
  </a>
  <a href="./LICENSE" alt="GitHub license">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://github.com/midwayjs/midway-serverless/actions?query=workflow%3A%22Node.js+CI%22" alt="Node.js CI">
    <img src="https://img.shields.io/badge/Node.js%20CI-passing-brightgreen" />
  </a>
  <a href="https://github.com/midwayjs/midway-serverless" alt="Activity">
    <img src="https://img.shields.io/github/commit-activity/m/midwayjs/midway-faas" />
  </a>
  <a href="https://github.com/midwayjs/midway-serverless/graphs/contributors" alt="Contributors">
    <img src="https://img.shields.io/github/contributors/midwayjs/midway-faas" />
  </a>
  <a href="https://gitpod.io/#https://github.com/midwayjs/midway-serverless" alt="Gitpod Ready-to-Code">
    <img src="https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod" />
  </a>
</p>

## Introduction

[详细介绍文章：阿里 Midway 正式发布 Serverless v1.0](https://github.com/midwayjs/midway/wiki/%E9%98%BF%E9%87%8C-Midway-%E6%AD%A3%E5%BC%8F%E5%8F%91%E5%B8%83-Serverless-v1.0%EF%BC%8C%E7%A0%94%E5%8F%91%E6%8F%90%E6%95%88-50%25)， 欢迎 Star 本仓库

Midway Serverless 是一个用于构建 Node.js 云函数的 Serverless 框架，可以帮您在云原生时代更专注于产品开发，降低维护成本。

- 1、平台间迁移更容易
  - 🐒 通过提供统一的配置规范以及入口抹平机制，让代码在每个平台基本相同；
  - 🦊 扩展不同云平台的运行时 API，不仅能加载通用的平台间扩展，也能接入公司内部的私有化部署方案；
- 2、让应用更易维护和扩展
  - 🐯 提供了标准的云平台函数出入参事件定义；
  - 🐦 提供了多套和社区前端 React、Vue 等融合一体化开发的方案；
  - 🐶 提供了 TypeScript 支持，方便应用扩展和定义；
  - 🐱 提供了完善的 Midway 体系标志性的依赖注入解决方案；
- 3、 生态更轻量和自由
  - 🦁 函数体系复用 koa 的生态和 Web 中间件能力，在处理传统 Web 时更加得心应手；
  - 🐴 提供 egg 组件复用 egg 插件的生态链，企业级开发链路更简单顺畅；
  - 🐘 Midway 体系的装饰器能力统一，让传统 Web 迁移到 Serverless 体系更快更好；



## 文档

- 快速开始 [中文](https://www.yuque.com/midwayjs/faas/quick_start)
- 文档 [中文](https://www.yuque.com/midwayjs/faas)


## 快速开始


### 安装 CLI 工具

首先，你需要安装 Node（> 10.9)，以及 npm。

```bash
npm install @midwayjs/faas-cli -g
```

### 创建示例

执行下面的命令。

```
f create
```

你会看到以下脚手架选择，选择脚手架或者示例代码，比如 `faas-standard` 。

```
Generating boilerplate...
? Hello, traveller.
  Which template do you like? …

 ⊙ Boilerplate
❯ faas-standard - A serverless boilerplate for aliyun fc, tencent scf and so on
  faas-layer - A serverless runtime layer boilerplate

 ⊙ Examples
  faas-react - A serverless example with react
  faas-vue - A serverless example with vue
```

![](https://camo.githubusercontent.com/7819739b6a9eb3d673124817b0d40e46dc963993/68747470733a2f2f63646e2e6e6c61726b2e636f6d2f79757175652f302f323032302f6769662f3530313430382f313539333636313634363431362d35636238663637392d336331302d343638392d386465612d6530313731326438653231662e67696623616c69676e3d6c65667426646973706c61793d696e6c696e65266865696768743d383731266d617267696e3d2535426f626a6563742532304f626a656374253544266e616d653d323032302d30372d303225323031312d34342d32382e323032302d30372d303225323031315f34365f34302e676966266f726967696e4865696768743d383731266f726967696e57696474683d313036302673697a653d373438353839267374617475733d646f6e65267374796c653d6e6f6e652677696474683d31303630)

### 部署函数

执行下面的命令即可发布到云平台。

```
f deploy
```

Midway Serverless 现已支持阿里云、腾讯云的部署，aws 正在开发中。


## 前端一体示例

当前已接入以下前端一体化示例。

|<img alt="React" src="https://user-images.githubusercontent.com/677114/42611693-f921fc7c-85c9-11e8-8de1-6d6013b92f69.png" width="72">| <img alt="Vue" src="https://user-images.githubusercontent.com/677114/42611543-44ef4502-85c9-11e8-9ef9-e9f98477c646.png" width="72">
| :---: | :---: |
| [React](https://www.yuque.com/midwayjs/faas/faas_with_react) | [Vue](https://www.yuque.com/midwayjs/faas/faas_with_vue) |

## 加入社区

扫码加入即刻交流与反馈：


<img alt="Join the chat at dingtalk" src="https://user-images.githubusercontent.com/418820/82108754-60371300-9763-11ea-88f4-fc59c743ea23.png" width="200">

## 生态体系

|    Project         |    Version                                |   Description       |
|----------------|-----------------------------------------|-----------|
| [midway-serverless] | [![faas-status]][faas-package] |新一代渐进式 Serverless 开发框架|
| [runtime-engine] | [![runtime-engine-status]][runtime-engine-package] |通用的基础 Serverless 运行时|
| [serverless-fc-starter] | [![serverless-fc-starter-status]][serverless-fc-starter-package] |阿里云 FC 函数启动器|
| [serverless-scf-starter] | [![serverless-scf-starter-status]][serverless-scf-starter-package] |腾讯云 SCF 函数启动器|
| [midway] | [![midway-status]][midway-package] |基于依赖注入面向未来的 Web 开发框架|


[midway-serverless]: https://github.com/midwayjs/midway/tree/serverless/packages/faas
[midway]: https://github.com/midwayjs/midway
[runtime-engine]: https://github.com/midwayjs/midway/tree/serverless/packages/runtime-engine
[faas-cli]: https://github.com/midwayjs/midway/tree/serverless/packages/faas-cli
[serverless-fc-starter]: https://github.com/midwayjs/midway/tree/serverless/packages/serverless-fc-starter
[serverless-scf-starter]: https://github.com/midwayjs/midway/tree/serverless/packages/serverless-scf-starter

[faas-status]: https://img.shields.io/npm/v/@midwayjs/faas.svg
[midway-status]: https://img.shields.io/npm/v/midway.svg
[runtime-engine-status]: https://img.shields.io/npm/v/@midwayjs/runtime-engine.svg
[serverless-fc-starter-status]: https://img.shields.io/npm/v/@midwayjs/runtime-engine.svg
[serverless-scf-starter-status]: https://img.shields.io/npm/v/@midwayjs/runtime-engine.svg

[faas-package]: https://npmjs.com/package/@midwayjs/faas
[midway-package]: https://npmjs.com/package/midway
[runtime-engine-package]: https://npmjs.com/package/@midwayjs/runtime-engine
[serverless-fc-starter-package]: https://npmjs.com/package/@midwayjs/serverless-fc-starter
[serverless-scf-starter-package]: https://npmjs.com/package/@midwayjs/serverless-scf-starter


## 社区合作伙伴

- [Koa](https://koajs.com/)
- [Egg](https://eggjs.org/)
- [icejs](https://ice.work/)
- [ykfe/ssr](https://github.com/ykfe/ssr/)

## Contributors

Please let us know how can we help. Do check out [issues](http://github.com/midwayjs/midway/issues) for bug reports or suggestions first.

To become a contributor, please follow our contributing guide.

This project exists thanks to all the people who contribute.
<a href="https://github.com/midwayjs/midway/graphs/contributors"><img src="https://opencollective.com/midway/contributors.svg?width=890&button=false" /></a>


## 协议

Midway Serverless 基于 [MIT licensed](./LICENSE) 协议开发.

## About

[Alibaba Open Source](https://opensource.alibaba.com/)
