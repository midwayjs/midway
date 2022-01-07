---
title: 聚合部署
---

Midway 针对 HTTP 场景，提供了一种聚合部署的方式，在开发时和传统 Web 应用类似，在部署时将多个路由部署在同一个函数容器中，可以节省冷启动时间，节省费用。

聚合部署模式特别适合用于传统中后台服务。

## 创建代码

创建聚合部署的代码示例。

```bash
$ npm -v

# 如果是 npm v6
$ npm init midway --type=faas-aggr my_midway_app

# 如果是 npm v7
$ npm init midway -- --type=faas-aggr my_midway_app
```

也可以执行 `npm init midway` ，选择 `faas-aggr` 脚手架。

:::info
该脚手架针对 HTTP 的场景做了特殊处理，会将所有的 HTTP 接口部署为同一个函数（聚合部署）。
:::

## 目录结构

以下就是一个函数的最精简的结构，核心会包括一个 `f.yml` 标准化函数文件，以及 TypeScript 的项目结构。

```bash
.
├── f.yml           # 标准化 spec 文件
├── package.json    # 项目依赖
├── src
│   └── index.ts    # 函数入口
└── tsconfig.json
```

我们来简单了解一下文件内容。

- `f.yml`   函数定义文件
- `tsconfig.json` tsc 配置文件（没有 IDE 会报错）
- `src` 函数源码目录
- `src/index.ts` 示例函数文件

## 函数文件

我们首先来看看函数文件，传统的函数是一个 `function` ，为了更符合 midway 体系，以及使用我们的依赖注入，这里将它变成了 Class。

和传统应用相同，我们依旧使用 `@Controller` 装饰器来开发聚合的 HTTP 函数。

如下代码，我们暴露了三个路由，在聚合部署模式下，会只部署成一个 HTTP 函数：

```typescript
import { Inject, Provide, Controller, Get, Post } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
@Controller('/')
export class APIService {
  @Inject()
  ctx: Context;

  @Get('/')
  async hello() {
    return 'Hello Midwayjs';
  }

  @Get('/get')
  async get() {
    return this.ctx.query;
  }

  @Post('/post')
  async post() {
    return this.ctx.method;
  }
}
```

## 函数定义文件

`f.yml` 是函数的定义文件，通过这个文件，在构建时生成不同平台所能认识的文件，示例中的文件内容如下。

```yaml
service:
  name: midway-faas-examples ## 函数组名，可以理解为应用名

provider:
  name: aliyun ## 发布的平台，这里是阿里云

aggregation: ## 对 HTTP 函数使用聚合模式部署
  all: ## 部署的函数名
    functionsPattern: ## 匹配的函数规则
      - '*'
```

## 本地开发

HTTP 函数本地开发和传统 Web 相同，输入以下命令。

```shell
$ npm run dev
$ open http://localhost:7001
```

Midway 会启动 HTTP 服务器，打开浏览器，访问 `[http://127.0.0.1:7001](http://127.0.0.1:7001)` ，浏览器会打印出 `Hello midwayjs`   的信息。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1615045887650-73a90be7-1d49-4024-82c4-fd6b5192e75e.png#height=384&id=JCH29&margin=%5Bobject%20Object%5D&name=image.png&originHeight=768&originWidth=1268&originalType=binary&ratio=1&size=85174&status=done&style=none&width=634" width="634" />

## 本地测试

使用和应用相同的测试方法来测试，针对 HTTP 函数，使用封装了 supertest 的 `createHttpRequest` 方法创建 HTTP 客户端。

唯一和应用不同的是，使用 `createFunctionApp` 方法创建函数应用（app）。

`createFunctionApp` 方法是 `createApp` 方法在函数场景下的定制（其中指定了函数的 `@midwayjs/serverless-app` 框架）。

:::info
这里不直接使用 `@midwayjs/faas` 框架，而是使用 `@midwayjs/serverless-app`   框架，因为后者包含了网关模拟到函数调用的系列步骤。
:::

HTTP 测试代码如下：

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/serverless-app';
import * as assert from 'assert';

describe('test/index.test.ts', () => {
  it('should get /', async () => {
    // create app
    const app = await createFunctionApp<Framework>();

    // make request
    const result = await createHttpRequest(app).get('/');

    // use expect by jest
    expect(result.status).toBe(200);
    expect(result.text).toBe('Hello Midwayjs');

    const result2 = await createHttpRequest(app).get('/get').query({ name: 123 });
    // or use assert
    assert.deepStrictEqual(result2.status, 200);
    assert.deepStrictEqual(result2.body.name, '123');

    // close app
    await close(app);
  });
});
```

## 和纯函数的区别

普通的函数，会将单个的函数注册到特定的路由上。客户端请求的流量，会分别打到不同的函数实例上，这样的好处是每个接口对应的函数实例数量可能都是不同的，调用多的接口，实例就多，调用少的接口就会少。

坏处就是，如果调用量较少，函数的冷启动概率就大，调用的时间会明显变大，由于每个函数都会有开销，资源没有复用，最终的收费也会变多。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618156727582-20f0df7c-9f91-430b-87a6-1796b1ee35e1.png#height=494&id=Rdl50&margin=%5Bobject%20Object%5D&name=image.png&originHeight=988&originWidth=1912&originalType=binary&ratio=1&size=85218&status=done&style=none&width=956" width="956" />

而聚合部署，会将所有的路由都注册到 `/*`  路由上，由框架内部的路由代码进行分发，所有的函数共享同一个容器，任意的请求都会让这个容器保活，使得冷启动的可能性大大减少。同时，由于代码是复用的，容器的复用率大大增加，比较适合于中后台这类请求均衡且接口的调用量相对均衡的场景。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618156735858-4ddb1d49-357d-4cec-8201-b2e49bde4b5f.png#height=456&id=I9ZeD&margin=%5Bobject%20Object%5D&name=image.png&originHeight=912&originWidth=1770&originalType=binary&ratio=1&size=59657&status=done&style=none&width=885" width="885" />

## 函数名规则

使用聚合模式部署的函数，我们一般使用 `@Controller`  装饰器或者一体化方式进行开发，和传统 Web 开发、测试保持一致。

在构建时，我们会生成 `f.yml`  中的 `functions`  字段，一般情况下用户不需要关心函数名，接口等信息。

在使用 `@Controller`  装饰器的情况下，生成的函数名规则为 `providerId_methodName` ，即依赖注入的 key 和方法名的组合。

比如：

```typescript
@Provide('userService') // <--- 取的是这个名字，如果不填，默认是类名的驼峰形式
@Controller('/api')
export class UserService {
  @Get('/get/:id')
  async getUser(@Query() name) {}

  @Post('/create')
  async createUser(@Query() name) {}
}
```

构建时会自动生成 `userService_getUser`  和 `userService_createUser`  两个函数并做内部路由处理。

下面是生成的 YAML 伪代码（实际由于是聚合部署，变为内部路由，并不会创建这段代码）。

```yaml
functions:
	userService_getUser:
  	events:
    	- http:
          method: get
          path: /get/[:id]
  userService_createUser:
  	events:
    	- http:
          method: post
          path: /create
```
