---
title: 路由
---

Midway Hooks 的路由机制是文件路由，我们会根据 目录/文件/导出的方法 来分析出路由配置。同时我们也提供了相应的配置选项。

## 默认配置

### 2.0 版本

在 2.0 中，我们将文件路由的配置统一至 `midway.config.ts` 中。

> midway.config.ts

```typescript
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

#### 字段解释

- source: 后端目录，默认为` ./src/apis`，你也可以指定为 `./src/functions` 等自定义目录
- routes: 路由配置，默认为数组
  - baseDir: 函数文件夹，文件夹下任意 `.ts` 文件导出的异步函数都会生成为 Api 接口
  - basePath: 生成的 API 地址前缀

### 1.0 版本

文件路由系统的解析机制是可配置的，下面是一体化项目中默认的配置。

> f.yml

```yaml
functionsRule:
  rules:
    - baseDir: lambda
      events:
        http:
          basePath: /api
```

#### 字段解释

- rules: 具体函数路由配置规则
  - baseDir: 函数文件夹，文件夹下任意 `.ts` 文件导出的异步函数都会生成为 Api 接口
  - events: 函数触发器配置
    - http
      - basePath: 生成的 API 地址前缀
      - underscore: 0.x 兼容逻辑，默认为 false，添加后将在具名路由的生成时，在方法名前添加下划线

## Index 路由

我们会将目录下 `index.ts` 文件，作为根路由。

- `/lambda/index.ts`  → `/`
- `/lambda/about/index.ts` →  `/about`​

## 嵌套路由

嵌套的文件也将生成嵌套的路由

- `/lambda/about.ts`  → `/about`
- `/lambda/blog/index.ts`  → `/blog`
- `/lambda/about/contact.ts`  →  `/about/contact`

## 导出方法与对应路由

默认导出的方法则会生成为根路径，而具名方法则会在路径上拼接函数名。

在此以 `/lambda/about.ts`   为例

- `export default () => {}`   → `/about`
- `export function contact ()` → `/about/contact`

## 通配路由

Midway Hooks 支持通过文件名生成通配符路由，例如：`/api/*` ，可以匹配 /api、/api/about、/api/about/a/b/c 等。只需要在文件名上加入 `...` 即可。

例子：

- `/lambda/[...index].ts` → `/api/*`
- `/lambda/[...user].ts` → `/api/user/*`
- `/lambda/about/[...contact].ts` → `/api/about/contact/*`

:::info
我们推荐在通配路由中，只存在 `export default` 方法，从而避免不必要的路由冲突
:::
