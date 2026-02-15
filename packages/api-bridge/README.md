# @midwayjs/api-bridge

Shared client runtime and transport SPI for Midway framework bridge packages.

## Install

```bash
npm i @midwayjs/api-bridge
```

```json
{
  "dependencies": {
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
    configuration.ts
  web/
    main.tsx
```

## Runtime Boundary

- `@midwayjs/core`: define API + route manifest.
- `@midwayjs/api-bridge`: client runtime + transport adapter contract.
- `@midwayjs/react` / `@midwayjs/nextjs`: framework glue only.

## How It Works

1. Server defines APIs with `defineApi`.
2. Build/dev bridge gets `RouteManifestItem[]`.
3. Convert manifest to operations.
4. Create typed client and call by `operationId`.

## Minimal Usage

```ts
import {
  createClient,
} from '@midwayjs/api-bridge';
import { userApi } from '@/server/api/user.api';

const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: '/api',
  }
);

await api.user.getUser({ params: { id: '1' } });
```

## Single Source Entry

```ts
// src/server/api/index.ts
export { userApi } from './user.api';
```

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/api-bridge';
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

默认会使用 `fetch` 作为 HTTP adapter（浏览器与 Node 18+ 可直接使用）。
如果要切换到 axios/tRPC 等实现，传入 `adapter` 即可。

## End-to-end Example (Midway)

```ts
import { MidwayWebRouterService } from '@midwayjs/core';
import {
  createClient,
  createOperationsFromManifest,
  createApiClientDefinition,
} from '@midwayjs/api-bridge';
import { userApi } from '@/server/api/user.api';

const routerService = new MidwayWebRouterService({ globalPrefix: 'api' });
const manifest = await routerService.getRouteManifest();

// optional: validate/inspect generated operations from manifest
const operations = createOperationsFromManifest(manifest);
createApiClientDefinition(operations);

const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: '/api',
    adapter: async ({ operation, input }) => {
      return fetch(operation.fullPath, {
        method: operation.method.toUpperCase(),
        body: JSON.stringify(input),
      }).then(res => res.json());
    },
  }
);

const user = await api.user.getUser({ params: { id: '1' } });
```
