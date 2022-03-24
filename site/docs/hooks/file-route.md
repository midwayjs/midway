---
title: 简易模式 & 文件系统路由
---

## 简易模式

在 Midway Hooks 中，我们提供了一个简易模式，可以使用纯函数来快速创建接口。

📢 注意：

- 简易模式需启用文件路由系统，需要在 `midway.config.js` 中启用 `routes` 配置。
- 纯函数自动生成的路由仅支持 `GET` 和 `POST` 方法，且全栈应用中，不支持传递 `Query / Params / Header` 参数
- 简易模式下，仍可以使用 `Api()` 定义路由，且支持手动定义路径，拼接的路径将自动加上 `basePath`

### Get 请求

```ts
import { useContext } from '@midwayjs/hooks';

export async function getPath() {
  // Get HTTP request context by Hooks
  const ctx = useContext();
  return ctx.path;
}
```

一体化调用：

```ts
import { getPath } from './api/lambda';
const path = await getPath();
console.log(path); // /api/getPath
```

手动调用：

```ts
fetcher
  .get('/api/getPath')
  .then((res) => {
    console.log(res.data); // /api/getPath
  });
```

### Post 请求

```ts
import { useContext } from '@midwayjs/hooks';

export async function post(
  name: string
) {
  const ctx = useContext();

  return {
    message: `Hello ${name}!`,
    method: ctx.method,
  };
}
```

一体化调用：

```ts
import { post } from './api/lambda';
const response = await post('Midway');
console.log(response.data); // { message: 'Hello Midway!', method: 'POST' }
```

手动调用：

```ts
fetch('/api/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    args: ['Midway'],
  }),
}).then((res) => {
  console.log(res.data); // { message: 'Hello Midway!', method: 'POST' }
});
```

### 通过 `Api()` 创建路由

简易模式下，我们仍支持通过 `Api()` 创建路由。

无效的例子：`Api(Get('/specify_path'))`，简易模式下不支持手动指定路径。

有效的例子，导出了两个路由。

```ts
import {
  Api,
  Get,
} from '@midwayjs/hooks';
import { useContext } from '@midwayjs/hooks';

export async function getPath() {
  // Get HTTP request context by Hooks
  const ctx = useContext();
  return ctx.path;
}

export default Api(Get(), async () => {
  return 'Hello Midway!';
});
```

## 文件系统路由

在 `midway.config.js` 中启用 `routes` 配置即启用文件路由系统 + 简易模式。

配置示例如下：

```ts
import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  source: './src/apis',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
});
```

字段解释：

- source: 后端目录，默认为 `./src/apis`，你也可以指定为 `./src/functions` 等自定义目录
- routes: 路由配置，默认为数组
  - baseDir: 函数文件夹，文件夹下任意 `.ts` 文件导出的异步函数都会生成为 Api 接口
  - basePath: 生成的 Api 地址前缀

### Index 路由

我们会将目录下 `index.ts` 文件，作为根路由。

- `/lambda/index.ts` → `/`
- `/lambda/about/index.ts` → `/about`

### 嵌套路由

嵌套的文件也将生成嵌套的路由<br />

- `/lambda/about.ts` → `/about`
- `/lambda/blog/index.ts` → `/blog`
- `/lambda/about/contact.ts` → `/about/contact`

### 导出方法与对应路由

默认导出的方法则会生成为根路径，而具名方法则会在路径上拼接函数名。

在此以 `/lambda/about.ts` 为例

- `export default () => {}` → `/about`
- `export function contact ()` → `/about/contact`

### 通配路由

如果需要生成通配符路由，例如：`/api/*` ，用于匹配 /api、/api/about、/api/about/a/b/c 等。文件名按 `[...file]` 命名即可。

📢 推荐在通配路由中，只使用 `export default` 方法导出函数，从而避免不必要的路由冲突

示例：

- `/lambda/[...index].ts` → `/api/*`
- `/lambda/[...user].ts` → `/api/user/*`
- `/lambda/about/[...contact].ts` → `/api/about/contact/*`

### 路径参数

如果需要生成动态路径参数，文件名按 `[file]` 格式命名即可。

例子：

- `/lambda/[name]/project.ts` → `/api/about/:name/project`
  - /about/midwayjs/project -> { name: 'midwayjs' }
- `/lambda/[type]/[page].ts` → `/api/about/:type/:page`
  - /blog/1 -> { type: 'blog', page: '1' }
  - /articles/3 -> { type: 'articles', page: '3' }

使用路径参数时，后端接口仅支持使用 `Api()` 开发，并使用 `Params<T>` 标注类型。

以 `/lambda/[name]/project.ts` 为例：

```ts
// lambda/[name]/project.ts
import {
  Api,
  Get,
  Params,
  useContext,
} from '@midwayjs/hooks';

export default Api(
  Get(),
  Params<{ name: string }>(),
  async () => {
    const ctx = useContext();
    return {
      name: ctx.params.name,
    };
  }
);
```

一体化调用：

```ts
import getProject from './api/[name]/project';
const response = await getProject({
  params: { name: 'midwayjs' },
});
console.log(response); // { name: 'midwayjs' }
```

手动调用：

```ts
fetch('/api/about/midwayjs/project')
  .then((res) => res.json())
  .then((res) => console.log(res)); // { name: 'midwayjs' }
```
