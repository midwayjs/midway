English | [简体中文](./README.zh-cn.md)

![](https://img.alicdn.com/tfs/TB1c1utMuT2gK0jSZFvXXXnFXXa-1422-305.png)

<p align="center">
  <a href="https://www.npmjs.com/package/@midwayjs/faas" alt="npm version">
    <img src="https://img.shields.io/npm/v/@midwayjs/faas.svg?style=flat" />
  </a>
  <a href="./LICENSE" alt="GitHub license">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://github.com/midwayjs/midway/actions?query=workflow%3A%22Node.js+CI%22" alt="Node.js CI">
    <img src="https://img.shields.io/badge/Node.js%20CI-passing-brightgreen" />
  </a>
  <a href="https://github.com/midwayjs/midway" alt="Activity">
    <img src="https://img.shields.io/github/commit-activity/m/midwayjs/midway" />
  </a>
  <a href="https://github.com/midwayjs/midway/graphs/contributors" alt="Contributors">
    <img src="https://img.shields.io/github/contributors/midwayjs/midway" />
  </a>
  <a href="https://gitpod.io/#https://github.com/midwayjs/midway" alt="Gitpod Ready-to-Code">
    <img src="https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod" />
  </a>
</p>

## Introduction

[Detailed introduction article: Alibaba Midway Serverless release v1.0](https://medium.com/@Lellansin/alibaba-midway-serverless-v1-0-lets-building-serverless-cloud-ecosystem-with-node-js-8a6d09a777a3)， welcome Star this repository.

Midway Serverless is a serverless framework used to build Node.js cloud functions. Helps you significantly reduce maintenance costs and focus more on product development in the cloud-native era.

- 1、Make applications easier to maintain and delivering
  - 🐦 Provided multiple sets of integrated development solutions for community front-end React, Vue, etc.;
  - 🐯 Provides standard cloud platform function entry and exit parameter definitions;
  - 🐶 Provides TypeScript support to facilitate application expansion and definition;
  - 🐱 Provides a complete Midway system iconic dependency injection solution;
- 2、 Ecology is more lightweight and free
  - 🦁 The function system reuses the ecological and Web middleware capabilities of koa, which is more handy when dealing with traditional Web;
  - 🐴 Provide an ecological chain of egg components reusing egg plug-ins, enterprise-level development links are simpler and smoother;
  - 🐘 The decorator capabilities of the Midway system are unified, making the traditional Web migration to the Serverless system faster and better;
- 3、Easier migration between platforms
  - 🐒 By providing a unified configuration specification and entry smoothing mechanism, the code is basically the same on each platform;
  - 🦊 Expanding the runtime APIs of different cloud platforms can not only load common inter-platform extensions, but also access the company's internal private deployment solutions;

## Document

- Quick Start - Function [English](https://github.com/midwayjs/midway/wiki/Standard-Function)
- Document [English](https://github.com/midwayjs/midway/wiki/) [中文](https://www.yuque.com/midwayjs/faas)

## Quick Start

### Install CLI

First, you need to install Node (> 10.9), and npm.

```bash
npm install @midwayjs/faas-cli -g
```

### Create First Function

Execute the following command.

```
f create
```

You will see the following scaffolding options, choose scaffolding or sample code, such as `faas-standard`.

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

### VSC Plugin

![](https://camo.githubusercontent.com/7819739b6a9eb3d673124817b0d40e46dc963993/68747470733a2f2f63646e2e6e6c61726b2e636f6d2f79757175652f302f323032302f6769662f3530313430382f313539333636313634363431362d35636238663637392d336331302d343638392d386465612d6530313731326438653231662e67696623616c69676e3d6c65667426646973706c61793d696e6c696e65266865696768743d383731266d617267696e3d2535426f626a6563742532304f626a656374253544266e616d653d323032302d30372d303225323031312d34342d32382e323032302d30372d303225323031315f34365f34302e676966266f726967696e4865696768743d383731266f726967696e57696474683d313036302673697a653d373438353839267374617475733d646f6e65267374796c653d6e6f6e652677696474683d31303630)

### Deploy Function

Execute the following command to publish to the cloud platform.

```
f deploy
```

Midway Serverless support Alibaba Cloud and Tencent Cloud. Amazon Lambda will be soon.

# Quick Start - Front-end Integration Examples

The following examples of front-end integration are currently connected. Visit the [Midway Gallery](http://demo.midwayjs.org/) to find more examples.

| [<img alt="React" src="https://user-images.githubusercontent.com/677114/42611693-f921fc7c-85c9-11e8-8de1-6d6013b92f69.png" width="72">](https://www.yuque.com/midwayjs/faas/faas_with_react?translate=en) | [<img alt="Vue" src="https://user-images.githubusercontent.com/677114/42611543-44ef4502-85c9-11e8-9ef9-e9f98477c646.png" width="72">](https://www.yuque.com/midwayjs/faas/faas_with_vue?translate=en) |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                 [React](https://www.yuque.com/midwayjs/faas/faas_with_react?translate=en)                                                                 |                                                                 [Vue](https://www.yuque.com/midwayjs/faas/faas_with_vue?translate=en)                                                                 |

The visualization project of COVID-2019 pandemic developed by react integration, it can be created by selecting faas-covid19 with command `f create`.

![](https://img.alicdn.com/tfs/TB1IxOkNeL2gK0jSZFmXXc7iXXa-1492-1168.png)

## Ecosystem

| Project                  | Version                                                            | Description                                                             |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [midway-serverless]      | [![faas-status]][faas-package]                                     | A new generation of progressive Serverless development framework        |
| [runtime-engine]         | [![runtime-engine-status]][runtime-engine-package]                 | Common basic Serverless runtime                                         |
| [serverless-fc-starter]  | [![serverless-fc-starter-status]][serverless-fc-starter-package]   | Alibaba Cloud FC function launcher                                      |
| [serverless-scf-starter] | [![serverless-scf-starter-status]][serverless-scf-starter-package] | Tencent Cloud SCF Function Launcher                                     |
| [midway]                 | [![midway-status]][midway-package]                                 | Future-oriented web development framework based on dependency injection |

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

## Community partners

- [Koa](https://koajs.com/)
- [Egg](https://eggjs.org/)
- [icejs](https://ice.work/)
- [ykfe/ssr](https://github.com/ykfe/ssr/)

## Contributors

Please let us know how can we help. Do check out [issues](http://github.com/midwayjs/midway/issues) for bug reports or suggestions first.

To become a contributor, please follow our contributing guide.

This project exists thanks to all the people who contribute.
<a href="https://github.com/midwayjs/midway/graphs/contributors"><img src="https://opencollective.com/midway/contributors.svg?width=890&button=false" /></a>

## license

Midway Serverless based [MIT licensed](./LICENSE).

## About

[Alibaba Open Source](https://opensource.alibaba.com/)
