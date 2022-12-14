# Introduction

Midway is a Node.js framework developed by Alibaba-Taobao front-end architecture team based on the concept of gradual development. Through self-developed dependency injection containers and various upper-level modules, Midway combines solutions suitable for different scenarios.

Midway is based on TypeScript development, combines two programming paradigms: `object-oriented (OOP + Class + IoC)` and `functional (FP + Function + Hooks)`, and supports various scenarios such as Web/full stack/microservice/RPC / Socket / Serverless, and is committed to providing users with a simple, easy-to-use and reliable Node.js server research and development experience.



## Why Midway

There are many similar frameworks in the community, so why do you need Midway?

There are three reasons:

1. Midway is a framework that has been continuously developed in Ali. Before, egg was used as the underlying framework and needed an application-oriented framework to interface with group scenarios.
2. Full use of TypeScript is the trend in the future, and future-oriented iteration and research and development are the requirements of architecture group innovation.
3. Although the community already has a framework like nest, the maintenance, collaboration, and modification of these products will be restricted by commercial products, and it is impossible to achieve rapid iteration of requirements and security guarantees. The overall research and development concept is also different from ours. For this reason, we need a self-developed framework system



## Our strengths

1. Midway framework is a Node.js framework that has been used internally for more than 5 years, backed by a team with long-term investment and continuous maintenance.
2. Has been tested in the annual promotion scene, stability need not worry
3. Rich components and scalability, such as database, cache, timing tasks, process model, deployment and support for new scenarios such as Web,Socket and even Serverless
4. The integrated calling scheme can be conveniently and quickly developed with front-end pages.
5. Good TypeScript definition support
6. Localized documentation and communication are easy and simple.



## Multi-programming paradigm

Midway supports two programming paradigms: object-oriented and functional. You can choose different programming paradigms to develop applications according to actual research and development needs.



### Object-oriented (OOP + Class + IoC)

Midway supports the object-oriented programming paradigm and provides a more elegant architecture for applications.

The following is an example of developing routes based on object-oriented.
```typescript
// src/controller/home.ts
import { Controller, Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context

  @Get('/')
  async home() {
    return {
      message: 'Hello Midwayjs!',
      query: this.ctx.ip
    }
  }
}
```



### Functional formula (FP + Function + Hooks)

Midway also supports a functional programming paradigm that provides higher R & D efficiency for applications.


The following is an example of developing a routing interface based on a function.
```typescript
// src/api/index.ts

import { useContext } from '@midwayjs/hooks'
import { Context } from '@midwayjs/koa';

export default async function home () {
  const ctx = useContext<Context>()

  return {
    message: 'Hello Midwayjs!',
    query: ctx.ip
  }
}
```



## Environmental preparation


Please install Node.js environment and npm in advance to run Midway. cnpm can be used in China.


- Operating system: supports macOS,Linux,Windows
- Running environment: We recommend that you select [LTS](http://nodejs.org/). The minimum requirement is **12.11.0**.

After continuous iteration, Midway's version requirements are as follows:

| Midway Version | Node Version |
| -------------- | ------------ |
| >=v3.9.0       | >= v12.11.0  |
| < 3.9.0        | >= v12.0.0   |
| > 2.0.0        | >= v10.0.0   |

For more information, see [How to install the Node.js environment](how_to_install_nodejs).



## Correct questions

- ✅Ask a question on [github issue](https://github.com/midwayjs/midway/issues), which can be traced, precipitated, and Star
   - 1. Describe your problem and provide as detailed a reproduction method as possible, framework version, scenario (Serverless or application)
   - 2. Provide error screenshots, stack information and minimum reproduction repo as much as possible.



## Q & A sharing group

There will be enthusiastic friends in the group and new versions will be released and pushed.

![image.png](https://img.alicdn.com/imgextra/i3/O1CN01F2EYhK1t290OXO4am_!!6000000005843-0-tps-3916-3220.jpg)



## Official publicity channels

- [Bilibili](https://space.bilibili.com/1746017680) provides updated information and tutorials.

