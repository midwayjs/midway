---
title: 扩展上下文定义
---

​

在某些场景下，需要扩展上下文 ctx 属性，比如 Web 场景下中间件，我们可以往上附加一些方法或者属性。

```typescript
import { Context } from 'egg';   // 或者其他上层框架导出的 Context

@Provide()
export class ReportMiddleware implements IWebMiddleware {

  resolve() {
    return async (ctx: Context, next) {

      ctx.abc = '123';
      await next();

    }
  }

}
```

但是由于 TypeScript 模块定义的关系，我们无法往现有的模块上去附加定义，所以我们使用了一种新的方法来扩展。
​

## 项目中扩展定义

​

你可以在 `src/interface.ts` 通过下面的代码，在项目中扩展 Midway 通用的 Context。

```typescript
// src/interface.ts
declare module '@midwayjs/core' {
  interface Context {
    abc: string;
  }
}
```

## 组件中扩展定义

你可以在组件的 `src/index.ts` 或者其他导出的文件出，通过下面的代码，扩展 Midway 通用的 Context。

```typescript
// src/interface.ts
declare module '@midwayjs/core/dist/interface' {
  interface Context {
    abc: string;
  }
}
```

组件中扩展和项目中略有不同（怀疑是 TS 的 bug）。
