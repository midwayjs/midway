English | [简体中文](./README.md)


![](https://img.alicdn.com/tfs/TB1HdniCSf2gK0jSZFPXXXsopXa-1000-353.png)

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

Midway FaaS is the Serverless framework used to build Node.js cloud functions. Helps you significantly reduce maintenance costs and focus more on product development in the cloud-native era.

- **Cross-cloud vendor**: One code can be deployed quickly across multiple cloud platforms, so you don't have to worry about your product being tied to a cloud vendor.
- **Code reuse**: Through the framework's dependency injection capability, each part of the logical unit is naturally reusable and can be quickly and easily combined to generate complex applications.
- **Traditional Migration**: Through the framework's runtime scalability, traditional applications such as Egg.js, Koa, Express.js and others can be seamlessly migrated to the cloud functions of various cloud vendors.

## Document

- Guide [中文](https://www.yuque.com/midwayjs/faas) and [English](https://www.yuque.com/midwayjs/faas/quick_start?translate=en)

## Ecology

|    Project         |    Version                                |   Description       |
|----------------|-----------------------------------------|-----------|
| [midway-faas] | [![faas-status]][faas-package] |A serverless framework based on dependency injection for adaptive multi-cloud platforms|
| [runtime-engine] | [![runtime-engine-status]][runtime-engine-package] |A base serverless runtime|
| [serverless-fc-starter] | [![serverless-fc-starter-status]][serverless-fc-starter-package] |Aliyun FC Function Launcher|
| [serverless-scf-starter] | [![serverless-scf-starter-status]][serverless-scf-starter-package] |Tencent Cloud SCF Function Launcher|
| [midway] | [![midway-status]][midway-package] |A future-proof web framework base on dependency injection |


[midway-faas]: https://github.com/midwayjs/midway-serverless
[midway]: https://github.com/midwayjs/midway
[runtime-engine]: https://github.com/midwayjs/midway-serverless/tree/master/packages/runtime-engine
[faas-cli]: https://github.com/midwayjs/midway-serverless/tree/master/packages/faas-cli
[serverless-fc-starter]: https://github.com/midwayjs/midway-serverless/tree/master/packages/serverless-fc-starter
[serverless-scf-starter]: https://github.com/midwayjs/midway-serverless/tree/master/packages/serverless-scf-starter

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

- [icejs](https://ice.work/)
- [ykfe/ssr](https://github.com/ykfe/ssr/)

## License

Midway FaaS is [MIT licensed](./LICENSE).
