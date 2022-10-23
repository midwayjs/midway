# 部署

Midway Hooks 支持 Api Server 与一体化两种模式。

## Api Server 部署

Api Server 部署可以参考：[启动和部署](https://midwayjs.org/docs/deployment)。

如果使用单文件部署，可以参考示例：[hooks-api-bundle-starter](https://github.com/midwayjs/hooks/blob/main/examples/api-bundle/readme.md)

## 一体化部署

一体化的构建产物中包含前后端，根据部署的难易程度，可以分为以下几类。

- 前后端部署在同一服务器上，由后端托管 HTML & 静态资源 & 提供接口
- 静态资源部署至 CDN，后端托管 HTML & 提供接口
- 静态资源部署至 CDN，HTML 由单独的服务托管（CDN / Nginx / etc.），后端仅提供接口

接下来我将介绍三种部署模式如何落地，优势及存在的问题。

### 前后端部署在同一服务器上

这是全栈套件默认的部署模式。

优势：最简单，将打包后的产物直接上传至服务器，启动后即可提供服务
劣势：

- 后端服务需要处理 & 发送文件
- 静态资源不在 CDN，不同地域的访问速度不稳定

整体部署架构如图所示：

![](https://img.alicdn.com/imgextra/i1/O1CN01GYtN9n1T2tbEXWOwf_!!6000000002325-2-tps-2064-648.png)

### 静态资源部署至 CDN，后端托管 HTML & 提供接口

这也是当前前端主流的部署模式。

优势：

- 静态资源由 CDN 托管，保证用户访问速度
- 后端托管 HTML，确保返回的 HTML 文件是最新的

劣势：

- 后端仍需要托管 HTML，仍需要处理 & 发送文件，且如果服务宕机则页面无法访问

整体访问架构如图所示：

![](https://img.alicdn.com/imgextra/i4/O1CN01ue3LJg1HeernvfxgQ_!!6000000000783-55-tps-267-367.svg)

#### 指定静态资源公共域名

在全栈套件项目中使用时，可以通过设置 `midway.config.ts` 中 `vite.base` 选项，来指定静态资源的公共域名。

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from '@midwayjs/hooks-kit';

export default defineConfig({
  vite: {
    plugins: [react()],
    base: 'https://cdn.example.com',
  },
});
```

此时访问页面时，静态资源会指向 CDN 的地址。

#### 部署静态文件

全栈套件项目中，默认的构建目录为 dist，其中 `dist/_clients` 为前端静态资源目录。

如下所示：

```
dist
├── _client
│   ├── assets
│   │   ├── index.85bb4f15.js
│   │   ├── index.b779b14d.css
│   │   └── vendor.346bc0da.js
│   ├── index.html
│   ├── logo.png
│   └── manifest.json
├── _serve
│   └── index.js
├── book.js
├── configuration.js
├── date.js
├── midway.config.js
└── star.js
```

你需要自行将 `_client` 目录下的文件上传至 CDN，而在部署后端时，仍然保留 `_client/index.html` 文件，以供后端托管使用。

### 静态资源部署至 CDN，HTML 由单独的服务托管（CDN / Nginx / etc.），后端仅提供接口

这也是前端目前主流的部署模式。

优势：

- 后端仅提供 API 接口，不需要处理 & 发送文件
- 静态资源由 CDN 托管，保证用户访问速度
- HTML 由单独服务托管，保证访问是页面是最新版本，后端服务宕机不影响页面展示
- 架构可拓展，可增加更多节点应对意外情况，如在后端前置增加网关节点，在后端服务宕机时切换至备用服务等

劣势：

- 复杂，对 CI / CD 流水线及基建要求高

整体访问架构如图所示

![](https://img.alicdn.com/imgextra/i1/O1CN01i78JiC1yinvfLq84b_!!6000000006613-55-tps-323-367.svg)

部署工作流如下：

![](https://img.alicdn.com/imgextra/i2/O1CN018oAQf71h1QxHtRHYY_!!6000000004217-2-tps-1728-1680.png)

#### 全栈套件部署指南

需要默认禁用全栈套件的 index.html 托管能力，此时全栈套件在构建时不会生成 `index.html` 的托管函数，仅提供 Api 服务。

```ts
import { defineConfig } from '@midwayjs/hooks-kit';

export default defineConfig({
  static: false,
});
```

在你的 CI / CD 工作流中，需要针对以下文件做单独处理。

- index.html：部署至单独的托管服务，如 Nginx / CDN 等，该服务只负责静态页面渲染
- 静态资源：部署至 CDN，如 Aliyun OSS 等，该服务可以提供静态资源的 CDN 加速
- Api 服务：部署至你的服务器中

最终的域名可能如下：

- index.html: https://example.com
- 静态资源: https://cdn.example.com
- Api 服务: https://api.example.com 或者 https://example.com/api（需要设置反向代理）
