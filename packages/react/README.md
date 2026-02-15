# @midwayjs/react

React bridge contracts for consuming Midway functional API definitions in web applications.

## Install

```bash
npm i @midwayjs/react @midwayjs/api-bridge
```

```json
{
  "dependencies": {
    "@midwayjs/react": "^4.0.0-beta.11",
    "@midwayjs/api-bridge": "^4.0.0-beta.11"
  }
}
```

## Recommended Project Layout

```txt
src/
  server/
    api/
      user.api.ts
  web/
    main.tsx
    app.tsx
```

## Runtime Boundary

- React continues using its own router/runtime.
- `@midwayjs/react` only provides bridge client helpers.
- It does not replace route matching.

## Server API Definition

```ts
// server/api/user.api.ts
import { defineApi } from '@midwayjs/core/functional';

export const userApi = defineApi('/users', api => ({
  getUser: api.get('/:id').meta({ routerName: 'getUser' }).handle(async () => {
    return { id: '1', name: 'harry' };
  }),
}));
```

## Web-side Usage

```ts
import {
  MidwayApiProvider,
  createClient,
  useMidwayApiOperation,
} from '@midwayjs/react';
import { userApi } from '@/server/api/user.api';

const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: '/api',
  }
);

function UserPage() {
  const callGetUser = useMidwayApiOperation('user.getUser');
  const user = await callGetUser({ params: { id: '1' } });
  return <div>{user.name}</div>;
}

// app root
<MidwayApiProvider client={api}>
  <UserPage />
</MidwayApiProvider>;
```

## Direct-like Pattern (Recommended)

```ts
// src/server/api/index.ts
export { userApi } from './user.api';
```

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/react';
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

Web 侧只依赖 `src/server/api` 定义，不需要额外维护一份 shared contracts。

## Alternative (Operation List)

```ts
import { createReactApiClientFromOperations } from '@midwayjs/react';

const api = createReactApiClientFromOperations(manifestOperations, {
  adapter: async ({ operation, input }) => {
    return fetch(operation.fullPath, {
      method: operation.method.toUpperCase(),
      body: JSON.stringify(input),
    }).then(res => res.json());
  },
});
```

默认 HTTP 调用使用 `fetch`。如果你要接入 axios 或 tRPC，给 `createClient(..., { adapter })` 传入自定义 adapter。

## End-to-end Steps

1. Use `defineApi` in `src/server/api`.
2. Import `userApi` in web side.
3. Create client with `createClient({ user: userApi }, ...)`.
4. Call by namespaced operationId via hook: `useMidwayApiOperation('user.getUser')`.
