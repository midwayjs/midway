---
title: 纯接口项目增加 Hooks 支持
---

如果你之前的项目是 Midway Web 或者 Midway FaaS 的纯接口项目，想在代码中使用纯函数的开发方式，那么可以参考本文档。
​

> 安装依赖

```bash
$ npm install @midwayjs/hooks -S
```

​

> 在根目录下新增：midway.config.ts

```typescript
import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  source: './src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
});
```

​

> 修改 configuration.ts（文件如不存在请新建）

```diff

 import { Configuration } from '@midwayjs/decorator';
 import { ILifeCycle } from '@midwayjs/core';
 import { join } from 'path';
+import { hooks } from '@midwayjs/hooks'

 @Configuration({
   importConfigs: [join(__dirname, './config/')],
   conflictCheck: true,
+  imports: [
+    hooks()
+  ]
 })
 export class ContainerLifeCycle implements ILifeCycle {
```

​

> 新增接口文件：src/lambda/index.ts

```typescript
export default () => {
  return 'Hello Midway Hooks!';
};
```

启动工程，访问 /api，查看接口是否正确返回 `Hello Midway Hooks!`。
