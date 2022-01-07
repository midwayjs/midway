---
title: 应用测试
---

经过大量的实践，我们沉淀出了一套标准的测试工具集。

- 测试工具包 [midway-bin](https://www.npmjs.com/package/midway-bin)
- 测试框架 mocha
- 测试断言库 assert/chai
- 测试模拟 [midway-mock](https://www.npmjs.com/package/midway-mock)

### 测试目录结构

我们约定 `test` 目录为存放所有测试脚本的目录，测试所使用到的 `fixtures` 和相关辅助脚本都应该放在此目录下。

测试脚本文件统一按 `${filename}.test.ts` 命名，必须以 `.test.ts` 作为文件后缀。

一个应用的测试目录示例：

```
test
├── controller
│   └── home.test.ts
├── hello.test.ts
└── service
    └── user.test.ts
```

### 测试命令

在脚手架中，我们已经将常见的命令进行内置，可能略微有些不同，大致代码如下。

```json
{
  "scripts": {
    "test": "midway-bin test --ts",
    "cov": "midway-bin cov --ts"
  }
}
```

然后就可以按标准的  `npm test`  来运行测试了。

```bash
npm test

> unittest-example@ test /Users/harry/midwayj/examples/unittest
> midway-bin test --ts

  test/hello.test.ts
    ✓ should work

  1 passing (10ms)
```

### 开始测试

在测试运行之前，我们首先要创建应用的一个 app 实例， 通过它来访问需要被测试的 Controller、Middleware、Service 等应用层代码。

通过 `midway-mock`，结合 Mocha 的 `before` 钩子就可以便捷地创建出一个 app 实例。

```typescript
// test/controller/home.test.js
import { mm } from 'midway-mock';

describe('test/controller/home.test.ts', () => {
  let app;
  before(() => {
    // 创建当前应用的 app 实例
    app = mm.app();
    // 等待 app 启动成功，才能执行测试用例
    return app.ready();
  });
});
```

这样我们就拿到了一个 app 的引用，接下来所有测试用例都会基于这个 app 进行。 更多关于创建 app 的信息请查看 [mm.app(options)](https://github.com/eggjs/egg-mock#options) 文档。

每一个测试文件都需要这样创建一个 app 实例非常冗余，因此 `midway-mock` 提供了一个 bootstrap 文件，可以直接从它上面拿到我们所常用的实例：

```typescript
// test/controller/home.test.ts
import { app, mock, assert } from 'midway-mock/bootstrap';

describe('test/controller/home.test.ts', () => {
  // test cases
});
```

### Controller 测试

我们可以通过 app.httpRequest() [SuperTest](https://github.com/visionmedia/supertest) 发起一个真实的 HTTP 请求来进行测试。app.httpRequest() 是 midway-mock 封装的 SuperTest 请求实例。

例如我们要给 `app/controller/home.ts`：

```typescript
import { controller, get, provide } from 'midway';

@provide()
@controller('/')
export class HomeController {
  @get('/')
  async index(ctx) {
    ctx.body = `Welcome to midwayjs!`;
  }
}
```

写一个完整的单元测试，它的测试代码 `test/controller/home.test.ts` 如下：

```typescript
import { app, assert } from 'midway-mock/bootstrap';

describe('test/controller/home.test.ts', () => {
  it('should GET /', () => {
    // 对 app 发起 `GET /` 请求
    return app
      .httpRequest()
      .get('/')
      .expect('Welcome to midwayjs!') // 期望 body 是 hello world
      .expect(200); // 期望返回 status 200
  });
});
```

通过基于 SuperTest 的 app.httpRequest() 可以轻松发起 GET、POST、PUT 等 HTTP 请求，并且它有非常丰富的请求数据构造接口，请查看 [SuperTest](https://github.com/visionmedia/supertest#getting-started) 文档。

### Service 测试

由于 midway 提倡使用 IoC 的方式来定义 service，所以编码与测试都与 eggjs 有明显的区别。

例如 `src/service/user.ts`:

```typescript
import { provide } from 'midway';
import { IUserService, IUserOptions, IUserResult } from '../../interface';

// 装载 service 到 IoC 容器
@provide('userService')
export class UserService implements IUserService {
  async getUser(options: IUserOptions): Promise<IUserResult> {
    return new Promise<IUserResult>((resolve) => {
      // 10ms 之后返回用户数据
      setTimeout(() => {
        resolve({
          id: options.id,
          username: 'mockedName',
          phone: '12345678901',
          email: 'xxx.xxx@xxx.com',
        });
      }, 10);
    });
  }
}
```

编写单元测试 `test/service/user.test.ts`：

```typescript
import { app, assert } from 'midway-mock/bootstrap';
import { IUserService } from '../../src/interface';

describe('test/service/user.test.ts', () => {
  it('#getUser', async () => {
    // 取出 userService
    const user = await app.applicationContext.getAsync<IUserService>('userService');
    const data = await user.getUser({ id: 1 });
    assert(data.id === 1);
    assert(data.username === 'mockedName');
  });
});
```

app.applicationContext 是 IoC 容器的应用上下文, 通过它可以异步取出注入的 service，并使用 service 进行测试。完整 demo 可以参见 [midway-test-demo](https://github.com/Lellansin/midway-test-demo)。

### 使用 Jest

Midway 在单元测试框架上，不仅支持 Mocha，也对 Jest 做了相应支持。具体使用步骤如下：

1.在项目根目录安装以下依赖：

```bash
$ npm install jest @types/jest ts-jest -D
```

2. 修改 `tsconfig.json`，避免 Mocha 与 Jest 的类型定义文件冲突

```json
{
  "compilerOptions": {
    "types": ["jest"]
  }
}
```

3. 在项目根目录下新增 `jest.config.js` 文件，内容如下：

```typescript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'midway-bin/jest/env.js',
};
```

4. 配置 npm scripts，修改 test 命令

```json
{
  "scripts": {
    "test": "jest --forceExit"
  }
}
```

5. 运行 npm scripts，即可使用 Jest 完成单测

```bash
npm run test
```

::: tip
我们也提供了可运行 demo 供大家参考：[demo-unittest-jest](https://github.com/midwayjs/midway-examples/tree/4a22e07c661a01aa05221fe56e11dce6c9bfc604/demo-unittest-jest)
:::
