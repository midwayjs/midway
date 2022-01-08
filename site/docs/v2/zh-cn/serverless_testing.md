---
title: 测试函数
---

## HTTP 类的函数

该方法适用于所有的类 HTTP 触发器的函数，包括 `HTTP` 和 `API_GATEWAY`。

使用和应用相同的测试方法来测试，针对 HTTP 函数，使用封装了 supertest 的 `createHttpRequest` 方法创建 HTTP 客户端。

唯一和应用不同的是，使用 `createFunctionApp` 方法创建函数应用（app）。

`createFunctionApp` 方法是 `createApp` 方法在函数场景下的定制（其中指定了函数的 `@midwayjs/serverless-app` 框架）。

:::info
这里不直接使用 `@midwayjs/faas` 框架，而是使用 `@midwayjs/serverless-app`  框架，因为后者包含了网关模拟到函数调用的系列步骤。
:::

HTTP 测试代码如下：

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

## 普通触发器

除了类 HTTP 触发器之外，我们还有其他比如定时器、对象存储等函数触发器，这些触发器由于和网关关系密切，不能使用 HTTP 行为来测试，而是使用传统的方法调用来做。

通过 `createFunctionApp` 方法创建函数 app，通过 `getServerlessInstance` 方法获取类实例，然后通过实例的方法直接调用，传入参数进行测试。

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

## 平台工具类

Midway 提供了平台工具类，用于快速创建测试数据。

现有的平台工具类包括：
| @midwayjs/serverless-fc-trigger | 阿里云触发器模拟 |
| --- | --- |
| @midwayjs/serverless-sfc-trigger | 腾讯云触发器模拟 |

这些工具类中，提供了一些快速创建初始化数据的方法。

比如，在阿里云函数中，提供了快速创建初始化上下文的方法，我们可以在初始化函数 app 时传入。

```typescript
import { createInitializeContext } from '@midwayjs/serverless-fc-trigger';

describe('test/hello_aliyun.test.ts', () => {
  // ...

  beforeAll(async () => {
    // 创建函数 app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext(), // 这里传入了 aliyun 特有的初始化上下文数据
    });

    // ...
  });
});
```

所有的工具方法都支持修改数据，可以通过参数传入，会和默认的数据做合并。比如要修改初始化上下文数据。

```typescript
import { createInitializeContext } from '@midwayjs/serverless-fc-trigger';

describe('test/hello_aliyun.test.ts', () => {
  // ...

  beforeAll(async () => {
    // 创建函数 app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext({
        accountId: 'xxxxxxx', // 可以按照结构，调整数据
      }),
    });

    // ...
  });
});
```

比如创建一个定时任务触发器的数据。

```typescript
import { createTimerEvent } from '@midwayjs/serverless-fc-trigger';

it('should get result from timer trigger', async () => {
  // 拿到服务类
  const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
  // 调用函数方法，传入参数
  await instance.handleTimer(createTimerEvent());
});
```

这里的 `createTimerEvent` 方法，会返回一个和平台相符的数据结构。

```json
{
  triggerTime: new Date().toJSON(),
  triggerName: 'timer',
  payload: '',
}
```

同样的，我们可以传递参数进行覆盖。

```json
 // 调用函数方法，传入参数
await instance.handleTimer(createTimerEvent({
	// ...
}));
```

具体的函数工具方法，可以查阅不同的平台触发器测试。
