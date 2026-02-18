# @midwayjs/nextjs

Next.js bridge helpers for Midway functional API definitions.

## Install

```bash
npm i @midwayjs/nextjs
```

```json
{
  "dependencies": {
    "@midwayjs/nextjs": "^4.0.0-beta.11"
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
    lib/
      api-client.ts
  server/
    api/
      user.api.ts
      index.ts
```

## Runtime Boundary

- Next.js keeps its own file routing (`app/api`, `pages/api`).
- `@midwayjs/nextjs` does not replace Next route matching.
- This package provides typed bridge client helpers.

## Server API Definition

```ts
// src/server/api/user.api.ts
import { defineApi } from '@midwayjs/core/functional';

export const userApi = defineApi('/users', api => ({
  getUser: api
    .get('/:id')
    .meta({ routerName: 'getUser' })
    .handle(async ({ input }) => {
      return {
        id: input.params?.id,
        name: 'harry',
      };
    }),
}));
```

```ts
// src/server/api/index.ts
export { userApi } from './user.api';
```

## Next Bridge Client

```ts
// src/app/lib/api-client.ts
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
```

## App Router Route Handler (Recommended)

```ts
// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { api } from '@/app/lib/api-client';

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  const user = await api.user.getUser({
    params: { id: context.params.id },
  });

  return NextResponse.json(user);
}
```

## Server Component Usage

```tsx
// src/app/page.tsx
import { api } from '@/app/lib/api-client';

export default async function Page() {
  const user = await api.user.getUser({ params: { id: 'u-1' } });
  return <pre>{JSON.stringify(user, null, 2)}</pre>;
}
```

For Client Components (`'use client'`), call Next API routes (or pass data from server components) instead of importing server API definitions directly.

## End-to-end Steps

1. Define APIs in `src/server/api` with `defineApi`.
2. Keep Next routes in `src/app/api/**/route.ts`.
3. Create bridge client in `src/app/lib/api-client.ts`.
4. Reuse typed methods as `api.user.getUser(...)` in route handlers/server components.

Default HTTP transport uses `fetch`. For axios/tRPC/custom channel, provide `adapter` in `createClient(..., { adapter })`.

## Dev & Build

- Development: run `next dev` (single process, Next handles routing and HMR).
- Production: Next builds web output; bridge typing still comes from `src/server/api` definitions.
- No Vite plugin is required for `@midwayjs/nextjs`.

## License

[MIT](https://github.com/midwayjs/midway/blob/master/LICENSE)
