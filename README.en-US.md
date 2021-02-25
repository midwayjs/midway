<p align="center">
  <a href="https://midwayjs.org/" target="blank"><img src="https://gw.alicdn.com/tfs/TB1OlNIUAL0gK0jSZFtXXXQCXXa-564-135.png" width="300" alt="Midway Logo" /></a>
</p>

<p align="center">A <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building Serverless services, traditional server-side applications, microservices, and small programs.</p>
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


## Description

Midway is a Node.js framework for building Serverless Services, traditional server-side applications, microservices and small programs.It written by typescript, which uses the IoC injection mechanism to decouple the business logic of the application and make the development of large Node.js application easier and more natural.

Midway can use koa, express or EggJS as the basic web framework. It also provides basic solutions for independent use such as Socket.io, GRPC, Dubbo.js, and RabbitMQ.

In addition, Midway is also a Node.js serverless framework for front-end/full-stack developers. Build applications for the next decade. It can run on AWS, Alibaba Cloud, Tencent Cloud and traditional VM/container. Easily integrate with React and Vue. 🌈


## Features

- ✔︎ Sophisticated group Middleware Architecture and compatibility
- ✔︎ Scalable plug-in capabilities and group plug-in Ecology
- ✔︎ Good application layering and decoupling capability
- ✔︎ Good development experience for the future
- ✔︎ Support Egg plugins and koa middleware

## Getting Started

- Midway v2  [中文文档](https://www.yuque.com/midwayjs/midway_v2) 📚
- Midway Serverless [中文文档](https://www.yuque.com/midwayjs/faas) 📚
- Midway v1 [中文文档](https://www.yuque.com/midwayjs/midway_v1) 📚

## Framework Ecosystem

| Project                  | Version                                                            | Description                                                             |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [@midwayjs/web]          | [![web-status]][web-package]                                       | Midway framework for EggJS                                              |
| [@midwayjs/koa]          | [![koa-status]][koa-package]                                       | Midway framework for Koa                                                |
| [@midwayjs/express]      | [![express-status]][express-package]                               | Midway framework for Express                                            |
| [@midwayjs/faas]         | [![faas-status]][faas-package]                                     | Midway framework for FaaS in Serverless environment                     |
| [@midwayjs/rabbitmq]     | [![rabbitmq-status]][rabbitmq-package]                             | Midway framework for rabbitMQ service                                   |
| [@midwayjs/socketio]     | [![socketio-status]][socketio-package]                             | Midway framework for Socket.io server                                   |
| [@midwayjs/grpc]         | [![grpc-status]][grpc-package]                                     | Midway framework for gRPC service                                       |


[@midwayjs/faas]: https://github.com/midwayjs/midway/tree/2.x/packages/faas
[@midwayjs/web]: https://github.com/midwayjs/midway/tree/2.x/packages/web
[@midwayjs/koa]: https://github.com/midwayjs/midway/tree/2.x/packages/web-koa
[@midwayjs/express]: https://github.com/midwayjs/midway/tree/2.x/packages/web-express
[@midwayjs/rabbitmq]: https://github.com/midwayjs/midway/tree/2.x/packages/rabbitmq
[@midwayjs/socketio]: https://github.com/midwayjs/midway/tree/2.x/packages/socketio
[@midwayjs/grpc]: https://github.com/midwayjs/midway/tree/2.x/packages/faas

[web-status]: https://img.shields.io/npm/v/@midwayjs/web.svg
[koa-status]: https://img.shields.io/npm/v/@midwayjs/koa.svg
[express-status]: https://img.shields.io/npm/v/@midwayjs/express.svg
[faas-status]: https://img.shields.io/npm/v/@midwayjs/faas.svg
[rabbitmq-status]: https://img.shields.io/npm/v/@midwayjs/rabbitmq.svg
[socketio-status]: https://img.shields.io/npm/v/@midwayjs/socketio.svg
[grpc-status]: https://img.shields.io/npm/v/@midwayjs/grpc.svg

[web-package]: https://npmjs.com/package/@midwayjs/web
[koa-package]: https://npmjs.com/package/@midwayjs/koa
[express-package]: https://npmjs.com/package/@midwayjs/express
[faas-package]: https://npmjs.com/package/@midwayjs/faas
[rabbitmq-package]: https://npmjs.com/package/@midwayjs/rabbitmq
[socketio-package]: https://npmjs.com/package/@midwayjs/socketio
[grpc-package]: https://npmjs.com/package/@midwayjs/grpc

## Tool and Runtime Ecosystem

| Project                  | Version                                                            | Description                                                             |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [@midwayjs/cli]         | [![midway-cli-status]][midway-cli-package]                 | Midway common cli tool                                         |
| [@midwayjs/faas-cli]         | [![midway-faas-cli-status]][midway-faas-cli-package]                 | Midway faas cli tool                                         |
| [@midwayjs/runtime-engine]         | [![runtime-engine-status]][runtime-engine-package]                 | Common basic Serverless runtime                                         |
| [@midwayjs/serverless-fc-starter]  | [![serverless-fc-starter-status]][serverless-fc-starter-package]   | Alibaba Cloud FC function launcher                                      |
| [@midwayjs/serverless-scf-starter] | [![serverless-scf-starter-status]][serverless-scf-starter-package] | Tencent Cloud SCF Function Launcher                                     |

[@midwayjs/cli]: https://github.com/midwayjs/cli/tree/master/packages/cli
[@midwayjs/faas-cli]: https://github.com/midwayjs/cli/tree/serverless/packages/faas-cli
[@midwayjs/runtime-engine]: https://github.com/midwayjs/midway/tree/2.x/packages-serverless/runtime-engine
[@midwayjs/serverless-fc-starter]: https://github.com/midwayjs/midway/tree/2.x/packages-serverless/serverless-fc-starter
[@midwayjs/serverless-scf-starter]: https://github.com/midwayjs/midway/tree/2.x/packages-serverless/serverless-scf-starter

[midway-cli-status]: https://img.shields.io/npm/v/@midwayjs/cli.svg
[midway-faas-cli-status]: https://img.shields.io/npm/v/@midwayjs/faas-cli.svg
[runtime-engine-status]: https://img.shields.io/npm/v/@midwayjs/runtime-engine.svg
[serverless-fc-starter-status]: https://img.shields.io/npm/v/@midwayjs/runtime-engine.svg
[serverless-scf-starter-status]: https://img.shields.io/npm/v/@midwayjs/runtime-engine.svg

[midway-cli-package]: https://npmjs.com/package/@midwayjs/cli
[midway-faas-cli-package]: https://npmjs.com/package/@midwayjs/faas-cli
[runtime-engine-package]: https://npmjs.com/package/@midwayjs/runtime-engine
[serverless-fc-starter-package]: https://npmjs.com/package/@midwayjs/serverless-fc-starter
[serverless-scf-starter-package]: https://npmjs.com/package/@midwayjs/serverless-scf-starter


## Examples

See [midway-examples](https://github.com/midwayjs/midway-examples).

## Issues

Please make sure to read the [Issue Reporting Checklist](CONTRIBUTING.md#reporting-new-issues) before opening an issue. Issues not conforming to the guidelines may be closed immediately.

## Contributors

Please let us know how can we help. Do check out [issues](http://github.com/midwayjs/midway/issues) for bug reports or suggestions first.

To become a contributor, please follow our contributing guide.

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/midwayjs/midway/graphs/contributors"><img src="https://opencollective.com/midway/contributors.svg?width=890&button=false" /></a>

## License

The code in this project is released under the [MIT License](LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmidwayjs%2Fmidway.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmidwayjs%2Fmidway?ref=badge_large)
