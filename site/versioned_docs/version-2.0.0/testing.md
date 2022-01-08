---
title: 测试
---

应用开发中，测试十分重要，在传统 Web 产品快速迭代的时期，每个测试用例都给应用的稳定性提供了一层保障。 API 升级，测试用例可以很好地检查代码是否向下兼容。 对于各种可能的输入，一旦测试覆盖，都能明确它的输出。 代码改动后，可以通过测试结果判断代码的改动是否影响已确定的结果。

所以，应用的 Controller、Service 等代码，都必须有对应的单元测试保证代码质量。 当然，框架和组件的每个功能改动和重构都需要有相应的单元测试，并且要求尽量做到修改的代码能被 100% 覆盖到。

## 测试目录结构

我们约定 `test` 目录为存放所有测试脚本的目录，测试所使用到的 `fixtures` 和相关辅助脚本都应该放在此目录下。

测试脚本文件统一按 `${filename}.test.ts` 命名，必须以 `.test.ts` 作为文件后缀。

一个应用的测试目录示例：

```bash
➜  my_midway_app tree
.
├── src
├── test
│   └── controller
│       └── home.test.ts
├── package.json
└── tsconfig.json
```

## 测试运行工具

Midway 默认提供 `midway-bin`  命令来运行测试脚本。在新版本中，Midway 默认将 mocha 替换成了 Jest，它的功能更为强大，集成度更高，这让我们**聚焦精力在编写测试代码**上，而不是纠结选择那些测试周边工具和模块。

只需要在 `package.json` 上配置好 `scripts.test` 即可。

```json
{
  "scripts": {
    "test": "midway-bin test --ts"
  }
}
```

然后就可以按标准的 `npm test` 来运行测试了，默认脚手架中，我们都已经提供了此命令，所以你可以开箱即用的运行测试。

```bash
➜  my_midway_app npm run test

> my_midway_project@1.0.0 test /Users/harry/project/application/my_midway_app
> midway-bin test

Testing all *.test.ts...
 PASS  test/controller/home.test.ts
 PASS  test/controller/api.test.ts

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        3.26 s
Ran all test suites matching /\/test\/[^.]*\.test\.ts$/i.
```

## 断言库

jest 中自带了强大的 `expect`  断言库，可以直接在全局使用它。

比如常用的。

```typescript
expect(result.status).toBe(200); // 值是否等于某个值，引用相等
expect(result.status).not.toBe(200);
expect(result).toEqual('hello'); // 简单匹配，对象属性相同也为 true
expect(result).toStrictEqual('hello'); // 严格匹配
expect(['lime', 'apple']).toContain('lime'); // 判断是否在数组中
```

更多断言方法，请参考文档 [https://jestjs.io/docs/en/expect](https://jestjs.io/docs/en/expect)

## 创建测试

不同的上层框架的测试方法不同，以最常用的 HTTP 服务举例，如果需要测试一个 HTTP 服务，一般来说，我们需要创建一个 HTTP 服务，然后用客户端请求它。

Midway 提供了一套基础的 `@midwayjs/mock`  工具集，可以帮助上层框架在这方面进行测试。同时也提供了方便的创建 Framework，App ，以及关闭的方法。

整个流程方法分为几个部分：

- `createApp`  创建某个 Framework 的 app 对象
- `close`  关闭一个 Framework 或者一个 app

为保持测试简单，整个流程目前就透出这两个方法。

```typescript
// create app
const app = await createApp<Framework>();
```

这里传入的 `Framework`  是用来给 TypeScript 推导类型的。这样就可以返回对应的框架 app 实例了。

当 app 运行完成后，可以使用 `close`  方法关闭。

```typescript
import { createApp, close } from '@midwayjs/mock';

await close(app);
```

事实上， `createApp`  方法中都是封装了 `@midwayjs/bootstrap` ，有兴趣的小伙伴可以阅读源码。

## 测试 HTTP 服务

除了创建 app 之外， `@midwayjs/mock`  还提供了简单的客户端方法，用于快速创建各种服务对应的测试行为。

比如，针对 HTTP，我们封装了 supertest，提供了 `createHttpRequest`  方法创建 HTTP 客户端。

```typescript
// 创建一个客户端请求
const result = await createHttpRequest(app).get('/');
// 测试返回结果
expect(result.text).toBe('Hello Midwayjs!');
```

推荐在一个测试文件中复用 app 实例。完整的测试示例如下。

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/web';
import { Application } from 'egg'; // 从特定的框架获取 App 定义
import * as assert from 'assert';

describe('test/controller/home.test.ts', () => {
  let app: Application;

  beforeAll(async () => {
    // 只创建一次 app，可以复用
    try {
      // 由于Jest在BeforeAll阶段的error会忽略，所以需要包一层catch
      // refs: https://github.com/facebook/jest/issues/8688

      app = await createApp<Framework>();
    } catch (err) {
      console.error('test beforeAll error', err);
      throw err;
    }
  });

  afterAll(async () => {
    // close app
    await close(app);
  });

  it('should GET /', async () => {
    // make request
    const result = await createHttpRequest(app).get('/').set('x-timeout', '5000');

    // use expect by jest
    expect(result.status).toBe(200);
    expect(result.text).toBe('Hello Midwayjs!');

    // or use assert
    assert.deepStrictEqual(result.status, 200);
    assert.deepStrictEqual(result.text, 'Hello Midwayjs!');
  });

  it('should POST /', async () => {
    // make request
    const result = await createHttpRequest(app).post('/').send({ id: '1' });

    // use expect by jest
    expect(result.status).toBe(200);
  });
});
```

**示例：**

创建 get 请求，传递 query 参数。

```typescript
const result = await createHttpRequest(app).get('/set_header').query({ name: 'harry' });
```

创建 post 请求，传递 body 参数。

```typescript
const result = await createHttpRequest(app).post('/user/catchThrowWithValidate').send({ id: '1' });
```

创建 post 请求，传递 form body 参数。

```typescript
const result = await createHttpRequest(app).post('/param/body').type('form').send({ id: '1' });
```

传递 header 头。

```typescript
const result = await createHttpRequest(app)
  .get('/set_header')
  .set({
    'x-bbb': '123',
  })
  .query({ name: 'harry' });
```

传递 cookie。

```typescript
const cookie = [
  'koa.sess=eyJuYW1lIjoiaGFycnkiLCJfZXhwaXJlIjoxNjE0MTQ5OTQ5NDcyLCJfbWF4QWdlIjo4NjQwMDAwMH0=; path=/; expires=Wed, 24 Feb 2021 06:59:09 GMT; httponly',
  'koa.sess.sig=mMRQWascH-If2-BC7v8xfRbmiNo; path=/; expires=Wed, 24 Feb 2021 06:59:09 GMT; httponly',
];

const result = await createHttpRequest(app).get('/set_header').set('Cookie', cookie).query({ name: 'harry' });
```

## 测试服务

在控制器之外，有时候我们需要对单个服务进行测试，我们可以从依赖注入容器中获取这个服务。

假设需要测试 `UserService` 。

```typescript
// src/service/user.ts
import { Provide } from '@midwayjs/decorator';

@Provide()
export class UserService {
  async getUser() {
    // xxx
  }
}
```

那么在测试代码中这样写。

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/web';
import * as assert from 'assert';
import { UserService } from '../../src/service/user';

describe('test/controller/home.test.ts', () => {
  it('should GET /', async () => {
    // create app
    const app = await createApp<Framework>();

    // 根据依赖注入 Id 获取实例
    const userService = await app.getApplicationContext().getAsync<UserService>('userService');
    // 根据依赖注入 class 获取实例
    const userService = await app.getApplicationContext().getAsync<UserService>(UserService);
    // 传入 class 忽略泛型也能正确推导
    const userService = await app.getApplicationContext().getAsync(UserService);

    // close app
    await close(app);
  });
});
```

如果你的服务和请求相关联（ctx），可以使用请求作用域获取服务。

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/web';
import * as assert from 'assert';
import { UserService } from '../../src/service/user';

describe('test/controller/home.test.ts', () => {
  it('should GET /', async () => {
    // create app
    const app = await createApp<Framework>();

    // 根据依赖注入 Id 获取实例
    const userService = await app.createAnonymousContext().requestContext.getAsync<UserService>('userService');

    // 也能传入 class 获取实例
    const userService = await app.createAnonymousContext().requestContext.getAsync(UserService);

    // close app
    await close(app);
  });
});
```

## createApp 选项参数

`createApp`  方法用于创建一个框架的 app 实例，通过传入泛型的框架类型，来使得我们推断出的 app 能够是该框架返回的 app。

比如：

```typescript
import { Framework } from '@midwayjs/grpc';

// 这里的 app 能确保是 grpc 框架返回的 app
const app = await createApp<Framework>();
```

`createApp`  方法其实是有参数的，它的方法签名如下。

```typescript
async createApp(
  appDir = process.cwd(),
  options: IConfigurationOptions = {},
  customFrameworkName?: string | MidwayFrameworkType | any)
)
```

第一个参数为项目的绝对根目录路径，默认为 `process.cwd()` 。
第二个参数为框架的启动参数，比如启动的端口等，由各个框架提供。
第三个参数为框架本身，一般用于自定义框架的测试，默认的框架在 API 内部已经有提供和排序。

比如，上面我们的示例，完整的写法为：

```typescript
import { Framework } from '@midwayjs/grpc';

// 这里的 app 能确保是 grpc 框架返回的 app
const app = await createApp<Framework>(process.cwd(), { port: 6565 }, Framework);
```

## close 选项参数

`close`  方法用于关闭该 app 实例相关的框架。

```typescript
await close(app);
```

其有一些参数。

```typescript
export declare function close(
  app: IMidwayApplication | IMidwayFramework<any, any>,
  options?: {
    cleanLogsDir?: boolean;
    cleanTempDir?: boolean;
    sleep?: number;
  }
): Promise<void>;
```

第一个参数是 app 或者 framework 的实例。

第二个参数是个对象，在执行关闭时可以执行一些行为：

- 1、 `cleanLogsDir`  默认为 false，控制测试完成后删除日志 logs 目录（windows 除外）
- 2、 `cleanTempDir`  默认为 false，清理一些临时目录（比如 egg 生成的 run 目录）
- 3、 `sleep`  默认为 50，单位毫秒，关闭 app 后延迟的时间（防止日志没有成功写入）

## 使用 bootstrap 文件测试

默认情况下，你的单测和入口文件是隔离的，比如在测试 Web 时，单测是不会启动一个真实的端口。如果你希望直接使用 `bootstrap.js`  入口文件直接测试，那么可以在测试的时候传递入口文件信息。

和 dev/test 启动不同的是，使用 `bootstrap.js`  启动是一个真实的服务，会同时运行多个框架，创建出多个框架的 app 实例。

`@midwayjs/mock` 提供了 `createBootstrap` 方法做启动文件类型的测试。我们可以将入口文件 `bootstrap.js` 作为启动参数传入，这样 `createBootstrap` 方法会通过入口文件来启动代码。

```typescript
import { MidwayFrameworkType } from '@midwayjs/decorator';

it('should GET /', async () => {
  // create app
  const bootstrap = await createBootstrap(join(process.cwd(), 'bootstrap.js'));
  // 根据框架类型获取 app 实例
  const app = bootstrap.getApp(MidwayFrameworkType.WEB_KOA);

  // expect and test

  // close bootstrap
  await bootstrap.close();
});
```

通过 `createBootstrap` 启动服务，默认的超时时间为 30s，我们可以通过参数修改它。

```typescript
import { createBootstrap } from '@midwayjs/mock';
import { MidwayFrameworkType } from '@midwayjs/decorator';

describe('/test/new.test.ts', () => {
  it('should GET /', async () => {
    // create app
    const bootstrap = await createBootstrap(join(process.cwd(), 'bootstrap.js'), {
      bootstrapTimeout: 10 * 1000, // 10s
    });
    const app = bootstrap.getApp(MidwayFrameworkType.WEB_KOA);

    // expect and test

    // close bootstrap
    await bootstrap.close();
  });
});
```

## 运行单个测试

和 mocha 的 `only`  不同，jest 的 `only`  方法只针对单个文件生效。 `midway-bin`  提供可以运行单个文件的能力。

```bash
$ midway-bin test -f test/controller/api.ts
```

这样可以指定运行某个文件的测试，再配合 `describe.only`  和 `it.only` ，这样可以只运行单个文件中的单个测试方法。

`midway-bin test --ts` 等价于直接使用 jest 的下面的命令。

```bash
$ node --require=ts-node/register ./node_modules/.bin/jest
```

## 自定义 Jest 文件内容

一般情况下，Midway 工具链内置了 jest 配置，使得用户无需再添加该文件，但是有些特殊的场景下，比如使用 VSCode 或者 Idea 等编辑器，需要在可视化区域进行开发和测试时，可能会需要指定一个 `jest.config.js`  的场景，这种情况下，Midway 支持创建一个自定义的 jest 配置文件。

在项目根目录创建一个 `jest.config.js`  文件。

```
➜  my_midway_app tree
.
├── src
├── test
│   └── controller
│       └── home.test.ts
├── jest.config.js
├── package.json
└── tsconfig.json
```

内容如下，配置和标准的 jest 相同。

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
};
```

## 常见设置

如果需要在单测前执行一些代码，可以增加 `jest.setup.js` ，增加配置如下。

```javascript
const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // 预先读取 jest.setup.js
};
```

:::caution
注意， `jest.setup.js` 只能使用 js 文件。
:::

### 示例一：测试代码时间较长的问题

如果测试出现下面的错误，说明你的代码执行时间比较长（比如连接数据库，跑任务等），如果确定代码没有问题，就需要延长启动时间。

```
Timeout - Async callback was not invoked within the 5000 ms timeout specified by jest.setTimeout.Error: Timeout - Async callback was not invoked within the 5000 ms timeout specified by jest.setTimeout.
```

jest 默认时间为 **5000ms（5 秒钟）**，我们可以将它调整到更多。

我们可以在 `jest.setup.js` 文件中写入下面的代码，对 jest 超时时间做调整。

```javascript
// jest.setup.js
jest.setTimeout(30000);
```

### 示例二：全局环境变量

同理， `jest.setup.js`  也可以执行自定义的代码，比如设置全局环境变量。

```javascript
// jest.setup.js
process.env.MIDWAY_TS_MODE = 'true';
```

### 示例三：程序无法正常退出的处理

有时候，由于一些代码（定时器，监听等）在后台运行，导致单测跑完后会无法退出进程，对于这个情况，jest 提供了 `--forceExit` 参数。

```bash
$ midway-bin test --ts --forceExit
$ midway-bin cov --ts --forceExit
```

也可以在自定义文件中，增加属性。

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  forceExit: true,
};
```

### 示例四：并行改串行执行

jest 默认为每个测试文件并行处理，如果测试代码中有启动端口等场景，并行处理可能会导致端口冲突而报错，这个时候需要加 `--runInBand` 参数，注意，这个参数只能加载命令中。

```bash
$ midway-bin test --ts --runInBand
$ midway-bin cov --ts --runInBand
```

## 编辑器配置

### Jetbrain Webstorm/Idea 配置

在 Jetbrain 的编辑器使用，需要启用 "jest" 插件，由于使用了子进程的方式启动，我们依旧需要在启动时指定加载 `--require=ts-node/register` 。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1602178225943-8502d66a-0fa4-43b8-b133-4f2cc47acdbd.png#height=692&id=a4cFb&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1384&originWidth=2184&originalType=binary&ratio=1&size=275268&status=done&style=none&width=1092" width="1092" />

### VSCode 配置

先搜索插件，安装 Jest Runner。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1617707260369-933cc245-e1e1-4ed2-8065-bc46026e7618.png#height=877&id=ylNin&margin=%5Bobject%20Object%5D&name=image.png&originHeight=877&originWidth=1242&originalType=binary&ratio=1&size=193316&status=done&style=none&width=1242" width="1242" />

打开配置，配置 jest 命令路径。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1617707314603-0a8ef997-8cea-493c-ab84-2ca76c0980dd.png#height=849&id=JVfV0&margin=%5Bobject%20Object%5D&name=image.png&originHeight=849&originWidth=1266&originalType=binary&ratio=1&size=94311&status=done&style=none&width=1266" width="1266" />

在 jest command 处填入 `node --require=ts-node/register ./node_modules/.bin/jest` 。

或者是在工作区文件夹 .vscode 里面设置 settings.json。

```javascript
{
  "jest.pathToJest": "node --require=ts-node/register ./node_modules/.bin/jest --detectOpenHandles",
  "jestrunner.jestCommand": "node --require=ts-node/register ./node_modules/.bin/jest --detectOpenHandles"
}
```

由于 jest runner 插件的调试使用的是 VSCode 的调试，需要单独配置 VSCode 的 launch.json。

在文件夹 .vscode 里面设置 launch.json

```javascript
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "runtimeArgs": [
        "--inspect-brk",
        "--require=ts-node/register",
        "${workspaceRoot}/node_modules/.bin/jest",
        "--runInBand",
        "--detectOpenHandles"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 配置 alias paths

tsc 将 ts 编译成 js 的时候，并不会去转换 import 的模块路径，因此当你在 `tsconfig.json`  中配置了 paths 之后，如果你在 ts 中使用 paths 并 import 了对应模块，编译成 js 的时候就有大概率出现模块找不到的情况。

解决办法是，要么不用 paths ，要么使用 paths 的时候只用来 import 一些声明而非具体值，再要么就可以使用 [tsconfig-paths](https://github.com/dividab/tsconfig-paths) 来 hook 掉 node 中的模块路径解析逻辑，从而支持 `tsconfig.json`  中的 paths。

```bash
$ npm i tsconfig-paths --save-dev
```

使用 tsconfig-paths 可以在 `src/configuration.ts`  中引入。

```typescript
// src/configuration.ts

import 'tsconfig-paths/register';
...
```

:::info
上述的方法只会对 dev 阶段（ ts-node）生效。
:::

在测试中，由于 Jest 的环境比较特殊，需要对 alias 再做一次处理，可以利用 Jest 的配置文件中的 `moduleNameMapper` 功能来替换加载到的模块，变相实现 alias 的功能。

```typescript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

注意，这里使用的 alias 前缀是 @ 符号，如果是其他的 alias 名，请自行修改。

## 使用 mocha 替代 jest

有些同学对 mocha 情有独钟，希望使用 mocha 作为测试工具。
​

可以使用 mocha 模式进行测试。

```bash
$ midway-bin test --ts --mocha
```

使用 mocha 进行单测时，需要手动安装 `mocha` 和 `@types/mocha` 两个依赖到 `devDependencies` 中：`npm i mocha @types/mocha -D` 。

:::info
注意，由于 mocha 没有自带断言工具，需要使用其他如 assert，chai 等工具进行断言。
:::
