---
title: 运行时配置 & Hooks 组件
---

​2.0 版
​

在 2.0 中，我们将 Midway Hooks 变为了 Midway 的 Component。
​

同时我们也支持了 `createConfiguration`，支持以函数的方式创建 `Midway Configuration`，减少 Class 与函数式混用所带来的迷惑感。
​

> ./src/apis/configuration.ts

```typescript
import { hooks, createConfiguration } from '@midwayjs/hooks';

export default createConfiguration({
  imports: [hooks()],
});
```

通过上述方式即可启用 Hooks 功能。
