# Next.js 集成

Next.js 场景优先保持 Next 原生路由体系，Midway 只提供服务层桥接。

## 安装

```bash
npm i @midwayjs/nextjs @midwayjs/api-bridge @midwayjs/core
```

```json
{
  "dependencies": {
    "@midwayjs/nextjs": "^4.0.0-beta.11",
    "@midwayjs/api-bridge": "^4.0.0-beta.11",
    "@midwayjs/core": "^4.0.0-beta.11"
  }
}
```

## 推荐目录

```txt
src/
  app/
    page.tsx
    api/
      users/[id]/route.ts
    lib/
      api-client.ts
  server/
    api/
      user.api.ts
      index.ts
```

## 客户端桥接

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

## Route Handler 调用

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

## Route Handler（基于 manifest）

```ts
// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import type { RouteManifestItem } from '@midwayjs/core';
import { api } from '@/app/lib/api-client';

const manifest: RouteManifestItem[] = []; // 由构建期或运行期注入

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  const operation = manifest.find(item => item.operationId === 'user.getUser');
  if (!operation) {
    return NextResponse.json({ message: 'operation not found' }, { status: 404 });
  }
  const user = await api.user.getUser({
    params: { id: context.params.id },
  });
  return NextResponse.json(user);
}
```

## 关键点

- 不接管 Next `app/api` 或 `pages/api` 路由匹配
- `@midwayjs/nextjs` 负责 typed client 与 transport 适配
- Next Client Component 建议通过 Next API 层间接访问，不直接导入 server 侧运行时代码
