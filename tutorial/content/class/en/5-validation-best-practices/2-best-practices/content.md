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

The previous lessons wired up routes, services, middleware, and validation. Before shipping, add at least one HTTP test that proves the route actually works.

This project now includes `jest` and `ts-jest`. `npm test` sets `NODE_ENV=unittest` and reads `koa.port: null` from `config.unittest.ts`, so it **does not bind 7001** and can run next to `npm run dev`.

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';

describe('home', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createApp(process.cwd());
  });

  afterAll(async () => {
    await close(app);
  });

  it('GET /', async () => {
    const res = await createHttpRequest(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello Midway!');
  });
});
```

Open a second terminal:

```bash
npm test
```

`GET /` should pass.

## Exercise

1. Add `GET /health` on `HomeController` returning `{ ok: true }`.
2. Add a test: status 200 and `res.body.ok === true`.

Run `npm test` again. Use **Solve** if you get stuck.

Worth covering later: happy path, validation failures (422), and business errors (404). A test that runs in CI is more useful than a deployment checklist.
