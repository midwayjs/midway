# React 集成

本节按“能跑起来”为目标，给出最小接入步骤。

## 安装

```bash
$ npm i @midwayjs/react @midwayjs/web-bridge @midwayjs/mock
```

```json
{
  "dependencies": {
    "@midwayjs/react": "^4.0.0",
    "@midwayjs/web-bridge": "^4.0.0",
    "@midwayjs/mock": "^4.0.0"
  }
}
```

## 1. 创建客户端

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/web-bridge';
import { userApi } from '../../server/api/user.api';

export const api = createClient(
  { user: userApi },
  { basePath: '/api' }
);
```

## 2. 在页面里调用

```tsx
import { useEffect, useState } from 'react';
import { api } from './api/client';

export function UserPage() {
  const [name, setName] = useState('');

  useEffect(() => {
    api.user.getUser({ params: { id: 'u-1' } }).then(user => {
      setName(user.name);
    });
  }, []);

  return <div>{name}</div>;
}
```

## 3. 配置 Vite 插件（推荐）

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { devPlugin } from '@midwayjs/mock/vite';
import { apiPlugin } from '@midwayjs/web-bridge/vite';

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

这两个插件的作用：

- `devPlugin`：开发时把后端服务带起来
- `apiPlugin`：让 `server/api` 导入在浏览器端可运行

## 4. 如果你用 Rspack

```ts
import { defineConfig } from '@rspack/cli';
import { createApiRspackRule } from '@midwayjs/web-bridge/rspack';

export default defineConfig({
  module: {
    rules: [
      createApiRspackRule({
        root: process.cwd(),
        apiDir: 'src/server/api',
      }),
    ],
  },
  devServer: {
    proxy: [{ context: ['/api'], target: 'http://127.0.0.1:7001' }],
  },
});
```

## 示例仓库

- `samples/react-functional-api`
- `samples/react-functional-api-axios`
- `samples/react-functional-api-rspack`
