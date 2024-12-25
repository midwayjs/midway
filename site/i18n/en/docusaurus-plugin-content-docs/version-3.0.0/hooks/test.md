# Testing

In Midway Hooks, we can quickly test the Http interface.

## Interface test

Take Hello World as an example. In `src/hello.ts`, we exported an interface with the following code.

```ts
import { Api, Get } from '@midwayjs/hooks';

export default Api(Get('/hello'), async () => {
  return 'Hello World!';
});
```

In the test, you can start the application through `@midwayjs/mock` and call the interface to complete the test.

### Call through `@midwayjs/hooks`

`@midwayjs/hooks` provides a `getApiTrigger (API: ApiFunction)` method that can be used to get triggers.

Take the above `hello` interface as an example, the `getApiTrigger(hello)` returns:

```json
{
  "type": "HTTP ",
  "method": "GET ",
  "path": "/hello"
}
```

Here, we use the `createHttpRequest` method provided by `@midwayjs/mock` to call the interface. For `createHttpRequest` usage documents, please refer to [supertest](https://github.com/visionmedia/supertest).

```ts
// src/hello.test.ts
import {
  close
  createApp
  createHttpRequest
} from '@midwayjs/mock';
import {
  Framework
  IMidwayKoaApplication
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

### Manual call

If you call this operation manually, you must specify parameters such as `Path`.

```ts
test('Hello World', async () => {
  const response = await createHttpRequest(app)
    .get('/hello')
    .expect(200);
  expect(response.text).toBe('Hello World!');
});
```

### Request parameter Data

Back-end code:

```ts
import { Api, Post } from '@midwayjs/hooks';

export default Api (
  Post(), // Http Path: /api/say
  async (name: string) => {
    return 'Hello ${name}!';
  }
);
```

Test code:

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

### Query parameter Query

Back-end code:

```ts
import {
  Api
  Get
  Query
  useContext
} from '@midwayjs/hooks';

export default Api (
  Get('/hello')
  Query<{ name: string }>()
  async () => {
    const ctx = useContext();
    return 'Hello ${ctx.query.name}!';
  }
);
```

Test code:

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

### Path parameter Params

Back-end code:

```ts
import { Api, Get, Params, useContext } from '@midwayjs/hooks'

export default Api (
  Get('/article/:id')
  Params<{ id: string }> (,
  async () => {
    const ctx = useContext()
    return {
      article: ctx.params.id
    }
  }
)
```

Test code:

```ts
test('Get Article', async () => {
  const response = await createHttpRequest(app)
    .get('/article/1')
    .expect(200);

  expect(response.body).toEqual({ article: '1' });
});
```

### Request header Headers

Back-end code:

```ts
import {
  Api
  Get
  Headers
  useContext
} from '@midwayjs/hooks';

export default Api (
  Get('/auth')
  Headers<{ token: string }>()
  async () => {
    const ctx = useContext();
    return {
      token: ctx.headers.token
    };
  }
);
```

Test code:

```ts
test('Auth', async () => {
  const response = await createHttpRequest(app)
    .get('/auth')
    .set('token', '123456')
    .expect(200);

  expect(response.body).toEqual({ token: '123456' });
});
```
