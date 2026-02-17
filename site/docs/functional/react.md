# React 集成

React 集成目标：直接复用 `src/server/api` 定义，前端写 `api.user.getUser(...)`，不手写 method/path。

## 安装

```bash
npm i @midwayjs/react @midwayjs/api-bridge @midwayjs/mock
```

```json
{
  "dependencies": {
    "@midwayjs/react": "^4.0.0-beta.11",
    "@midwayjs/api-bridge": "^4.0.0-beta.11",
    "@midwayjs/mock": "^4.0.0-beta.11"
  }
}
```

## 客户端创建

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/react';
import { userApi } from '../../server/api';

export const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: '/api',
  }
);
```

## 页面调用

```tsx
import { useEffect, useState } from 'react';
import { api } from './api/client';

export function UserPage() {
  const [name, setName] = useState('');

  useEffect(() => {
    api.user
      .getUser({ params: { id: 'u-1' } })
      .then(user => setName(user.name));
  }, []);

  return <div>{name}</div>;
}
```

## Vite 插件

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { devPlugin } from '@midwayjs/mock/vite';
import { apiPlugin } from '@midwayjs/react/vite';

export default defineConfig({
  plugins: [
    devPlugin({
      appDir: process.cwd(),
      baseDir: 'src/server',
      basePath: '/api',
    }),
    react(),
    apiPlugin({
      root: process.cwd(),
      apiDir: 'src/server/api',
      target: 'both',
    }),
  ],
});
```

## 说明

- `devPlugin`: 开发期内嵌 Midway runtime
- `apiPlugin`: 改写 `server/api` 导入，保证浏览器端可运行
- 生产环境建议 server/web 独立构建发布
