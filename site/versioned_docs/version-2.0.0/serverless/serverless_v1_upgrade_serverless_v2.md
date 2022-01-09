---
title: 从 Serverless v1 迁移到 v2
---

本文章介绍如何从 Serverless v1.0 迁移到 Serverless v2.0。

Midway Serverless 2.0 的升级主要体现在架构和包的变化上，功能本身变化不大。

## 升级方式

### 1、全局 CLI 的升级

移除原有的 `@midwayjs/faas-cli`  包，不再使用 `f`  全局命令，改为项目下的包和命令。

```bash
$ npm uninstall @midwayjs/faas-cli -g
```

### 2、项目包版本的升级

依赖包升级。

```json
"dependencies": {
  "@midwayjs/faas": "^2.0.0"
},
```

开发依赖包升级（向传统应用靠拢）。

```json
  "devDependencies": {
    "@midwayjs/cli": "^1.2.45",
    "@midwayjs/mock": "^2.8.7",
    "@midwayjs/serverless-app": "^2.8.7",
    "@midwayjs/fcli-plugin-fc": "^1.2.45",
    "@types/jest": "^26.0.10",
    "@types/node": "^14",
    "typescript": "^4.0.0"
  }
```

- 1、将原有的 mocha 测试换成了 jest，所以 `@types/mocha`  变为了 `@types/jest` 。
- 2、 `@midwayjs/serverless-invoke`  被移除，由于采用了应用的测试方式，不再需要。
- 3、平台模块区分， `@midwayjs/fcli-plugin-fc`  该模块是用于阿里云 FC 环境的工具包，如果要发布到腾讯云 SCF 环境，请使用 `midwayjs/fcli-plugin-scf` 。

### 3、脚本的升级

向应用靠拢，提供了 `dev` 、 `test` 、 `deploy`  命令。

```json
  "scripts": {
    "dev": "midway-bin dev --ts",
    "test": "midway-bin test --ts",
    "deploy": "midway-bin deploy"
  },
```

- 原有的 `build` 命令被移除，因为部署时 deploy 会自动 build
- 原有的 `f test`  命令将和开发应用相同，替换为 `midway-bin test --ts`
- 原有的 `f dev`  和 debug，将和开发应用相同，统一使用 `midway-bin dev --ts` ，调试方式也相同

### 4、包定义变更

常见定义变更。

原有的 `IFaaSApplication` 变为 `Application` ，和应用一致从 `@midawyjs/faas` 包获取。

```typescript
import { Application, Context } from '@midwayjs/faas';
```

原有的小写装饰器变为大写，和应用一致从 `@midwayjs/decorator` 获取。

```typescript
import { App, Config } from '@midwayjs/decorator';
```

原有的 `ILifeCycle` ， `IMidwayContainer` 为容器定义，和应用一致从 `@midwayjs/core` 获取。

```typescript
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
```

### 5、运行

HTTP 类的函数，本地直接使用 `npm run dev` 运行，非 HTTP 类的函数，请使用 `npm run test` 进行测试开发。

## 可选的调整

### 1、@Func 装饰器升级为 @ServerlessTrigger 装饰器

现有代码依旧可以使用 `@Func` 装饰器兼容，新代码请使用 `@ServerlessTrigger` 装饰器，构建器可以通过分析 `@ServerlessTrigger` 装饰器，自动生成 yml 内容。

### 2、f.yml

使用了 `@ServerlessTrigger` 装饰器后，f.yml 中的 functions 字段可以移除。编译时会自动根据代码生成函数路由信息。

### 3、测试代码的调整

HTTP 类型的函数，使用和应用相同的封装了 supertest 的 `createHttpRequest` 方法创建 HTTP 客户端。

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';

describe('test/hello_aliyun.test.ts', () => {
  let app: Application;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>();
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from api gateway trigger', async () => {
    const result = await createHttpRequest(app).get('/').query({
      name: 'zhangting',
    });
    expect(result.text).toEqual('hello zhangting');
  });
});
```

除了类 HTTP 触发器之外，我们还有其他比如定时器、对象存储等函数触发器，这些触发器由于和网关关系密切，不能使用 HTTP 行为来测试，而是使用传统的方法调用来做。

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { createInitializeContext } from '@midwayjs/serverless-fc-trigger';

describe('test/hello_aliyun.test.ts', () => {
  let app: Application;
  let instance: HelloAliyunService;

  beforeAll(async () => {
    // 创建函数 app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext(), // 这里传入了 aliyun 特有的初始化上下文数据
    });

    // 拿到服务类
    instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from event trigger', async () => {
    // 调用函数方法，传入参数
    expect(await instance.handleEvent('hello world')).toEqual('hello world');
  });
});
```
