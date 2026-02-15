# midwayjs nextjs module

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midwayjs/midway/pulls)

this is a sub package for midway.

Document: [https://midwayjs.org](https://midwayjs.org)

## Install

```bash
npm i @midwayjs/nextjs @midwayjs/api-bridge
```

```json
{
  "dependencies": {
    "@midwayjs/nextjs": "^4.0.0-beta.11",
    "@midwayjs/api-bridge": "^4.0.0-beta.11"
  }
}
```

## Recommended Project Layout

```txt
src/
  app/
    page.tsx
    api/
      users/
        [id]/
          route.ts
  server/
    api/
      user.api.ts
```

## Runtime Boundary

- Next.js keeps its own file routing (`app/api`, `pages/api`).
- `@midwayjs/nextjs` does not replace Next routing.
- This package only provides bridge client helpers.

## Server API Definition

```ts
import { defineApi } from '@midwayjs/core/functional';

export const userApi = defineApi('/users', api => ({
  getUser: api.get('/:id').meta({ routerName: 'getUser' }).handle(async () => {
    return { id: '1', name: 'harry' };
  }),
}));
```

## Next-side Usage

```ts
import { createClient } from '@midwayjs/nextjs';
import { userApi } from '@/server/api/user.api';

const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: '/api',
  }
);

const user = await api.user.getUser({ params: { id: '1' } });
```

## Direct-like Pattern (Recommended)

```ts
// src/server/api/index.ts
export { userApi } from './user.api';
```

```ts
// src/app/api-client.ts
import { createClient } from '@midwayjs/nextjs';
import { userApi } from '@/server/api';

export const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: '/api',
  }
);

const user = await api.user.getUser({
  params: { id: '123' },
});
```

## End-to-end Steps

1. Define APIs in `src/server/api` with `defineApi`.
2. Import `userApi` in Next app layer.
3. Create bridge client with `createClient({ user: userApi }, ...)`.
4. Call directly as `api.user.getUser(...)`.

默认 HTTP 调用使用 `fetch`。如果你希望走 axios、tRPC 等通道，可以在 `createClient(..., { adapter })` 中覆盖。

## License

[MIT](https://github.com/midwayjs/midway/blob/master/LICENSE)
