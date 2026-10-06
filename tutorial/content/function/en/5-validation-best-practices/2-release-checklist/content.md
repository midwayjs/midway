---
title: HTTP tests with mock
focus: /test/home.test.ts
test: true
routes:
  - /
  - /health
checks:
  - /health
---

# HTTP tests with mock

Once contracts, middleware, and error shape are in place, add an HTTP test that actually runs. This project includes `jest` / `ts-jest`. `npm test` uses `NODE_ENV=unittest` and `koa.port: null`, so it will not fight `npm run dev` for port 7001.

```ts
import { createApp, close, createHttpRequest } from '@midwayjs/mock';

it('GET /', async () => {
  const res = await createHttpRequest(app).get('/');
  expect(res.status).toBe(200);
  expect(res.body.message).toBe('Hello Midway Functional!');
});
```

`createApp(process.cwd())` boots a test app from the current project. In a second terminal:

```bash
npm test
```

## Exercise

1. Add `GET /health` on `home.api.ts` returning `{ ok: true }`
2. Add the matching assertion in `test/home.test.ts`

Run `npm test` again. Use **Solve** if you get stuck.

Also worth checking before a release: write APIs have `input/output`, errors are JSON, and `createClient` `basePath` matches `globalPrefix`.
