# @midwayjs/web-bridge

Framework-neutral bridge for Midway functional API client/runtime and build-time transforms.

## Install

```bash
npm i @midwayjs/web-bridge
```

```json
{
  "dependencies": {
    "@midwayjs/web-bridge": "^4.0.0-beta.11"
  }
}
```

## Runtime client

```ts
import { createClient } from '@midwayjs/web-bridge';
import { userApi } from '@/server/api/user.api';

export const api = createClient(
  { user: userApi },
  { basePath: '/api' }
);
```

## Vite transform plugin

```ts
import { apiPlugin } from '@midwayjs/web-bridge/vite';

apiPlugin({
  root: process.cwd(),
  apiDir: 'src/server/api',
  target: 'both',
});
```

## Rspack transform rule

```ts
import { createApiRspackRule } from '@midwayjs/web-bridge/rspack';

createApiRspackRule({
  root: process.cwd(),
  apiDir: 'src/server/api',
});
```
