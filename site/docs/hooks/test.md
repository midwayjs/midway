---
title: 测试
---

在 Midway Hooks 中，我们可以快速的对 Http 接口进行测试。

## 接口测试

此处以 Hello World 为例，我们在 `src/hello.ts` 中，导出了一个接口，代码如下。

```ts
import { Api, Get } from '@midwayjs/hooks';

export default Api(Get('/hello'), async () => {
  return 'Hello World!';
});
```

在测试中，你可以通过 `@midwayjs/mock` 去启动应用，并调用接口完成测试。

### 通过 `@midwayjs/hooks` 调用

`@midwayjs/hooks` 提供了 `getApiTrigger(api: ApiFunction)` 方法，可以用于获取触发器。

以上面的 `hello` 接口为例，`getApiTrigger(hello)` 将返回：

```json
{
  "type": "HTTP",
  "method": "GET",
  "path": "/hello"
}
```

在此，我们使用 `@midwayjs/mock` 提供的 `createHttpRequest` 方法来调用接口。`createHttpRequest` 的使用文档可以参考 [supertest](https://github.com/visionmedia/supertest)。

```ts
// src/hello.test.ts
import {
  close,
  createApp,
  createHttpRequest,
} from '@midwayjs/mock';
import {
  Framework,
  IMidwayKoaApplication,
} from '@midwayjs/koa';
import { getApiTrigger, HttpTriger } from '@midwayjs/hooks';
import hello from './hello';

describe('test koa with api router', () => {
  let app: IMidwayKoaApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await close(app);
  });

  test('Hello World', async () => {
    const trigger = getApiTrigger<HttpTriger>(hello);
    const response = await createHttpRequest(app)
      .get(trigger.path)
      .expect(200);
    expect(response.text).toBe('Hello World!');
  });
});
```

### 手动调用

手动调用的情况下，需要填入 `Path` 等参数。

```ts
test('Hello World', async () => {
  const response = await createHttpRequest(app)
    .get('/hello')
    .expect(200);
  expect(response.text).toBe('Hello World!');
});
```

### 请求参数 Data

后端代码：

```ts
import { Api, Post } from '@midwayjs/hooks';

export default Api(
  Post(), // Http Path: /api/say,
  async (name: string) => {
    return `Hello ${name}!`;
  }
);
```

测试代码：

```ts
test('Hello World', async () => {
  const trigger = getApiTrigger<HttpTriger>(say);
  const response = await createHttpRequest(app)
    .post(trigger.path)
    .send({ args: ['Midway'] })
    .expect(200);
  expect(response.text).toBe('Hello Midway!');
});
```

### 查询参数 Query

后端代码：

```ts
import {
  Api,
  Get,
  Query,
  useContext,
} from '@midwayjs/hooks';

export default Api(
  Get('/hello'),
  Query<{ name: string }>(),
  async () => {
    const ctx = useContext();
    return `Hello ${ctx.query.name}!`;
  }
);
```

测试代码：

```ts
test('Hello World', async () => {
  const trigger = getApiTrigger<HttpTriger>(hello);
  const response = await createHttpRequest(app)
    .get(trigger.path)
    .query({ name: 'Midway' })
    .expect(200);
  expect(response.text).toBe('Hello Midway!');
});
```

### 路径参数 Params

后端代码：

```ts
import { Api, Get, Params, useContext } from '@midwayjs/hooks'

export default Api(
  Get('/article/:id'),
  Params<{ id: string }>(,
  async () => {
    const ctx = useContext()
    return {
      article: ctx.params.id
    }
  }
)
```

测试代码：

```ts
test('Get Article', async () => {
  const response = await createHttpRequest(app)
    .get('/article/1')
    .expect(200);

  expect(response.body).toEqual({ article: '1' });
});
```

### 请求头 Headers

后端代码：

```ts
import {
  Api,
  Get,
  Headers,
  useContext,
} from '@midwayjs/hooks';

export default Api(
  Get('/auth'),
  Headers<{ token: string }>(),
  async () => {
    const ctx = useContext();
    return {
      token: ctx.headers.token,
    };
  }
);
```

测试代码：

```ts
test('Auth', async () => {
  const response = await createHttpRequest(app)
    .get('/auth')
    .set('token', '123456')
    .expect(200);

  expect(response.body).toEqual({ token: '123456' });
});
```
