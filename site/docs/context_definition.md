# 扩展上下文定义

由于 TS 的静态类型分析，我们并不推荐动态去挂载某些属性，动态的挂载会导致 TS 的类型处理非常困难。在某些特殊场景下，如果需要扩展上下文 ctx 属性，比如 Web 场景下中间件，我们可以往上附加一些方法或者属性。

```typescript
import { Middleware } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IWebMiddleware {

  resolve() {
    return async (ctx: Context, next) => {

      ctx.abc = '123';
      await next();

    }
  }

}
```

但是由于 TypeScript 模块定义的关系，我们无法往现有的模块上去附加定义，所以我们使用了一种新的方法来扩展。




## 项目中扩展定义


你可以在 `src/interface.ts` 通过下面的代码，在项目中扩展 Midway 通用的 Context。

```typescript
// src/interface.ts

import '@midwayjs/core';

// ...

declare module '@midwayjs/core' {
  interface Context {
    abc: string;
  }
}
```

:::info

注意，`declare module` 会替代原有的定义，所以请在之前使用 `import` 语法导入模块后再操作。

:::



## 组件中扩展定义

组件中略有不同，一般来说，组件可能是只能在特定的场景使用。

你可以在组件根目录的 `index.d.ts` 通过下面的代码，扩展 Midway 通用的 Context。

如果你希望对所有场景的 Context 做扩展。

```typescript
// index.d.ts

// 下面这段可以对所有的 Context 做扩展
declare module '@midwayjs/core/dist/interface' {
  interface Context {
    abc: string;
  }
}
```

如果你只希望对特定场景的 Context 做扩展。

```typescript
// index.d.ts

// 下面这段只 @midwayjs/koa 的 Context 做扩展
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    abc: string;
  }
}

// 下面这段只 @midwayjs/web 的 Context 做扩展
declare module '@midwayjs/web/dist/interface' {
  interface Context {
    abc: string;
  }
}

// 下面这段只 @midwayjs/faas 的 Context 做扩展
declare module '@midwayjs/faas/dist/interface' {
  interface Context {
    abc: string;
  }
}

// 下面这段只 @midwayjs/express 的 Context 做扩展
declare module '@midwayjs/express/dist/interface' {
  interface Context {
    abc: string;
  }
}

```

:::caution
- 1、组件中扩展和项目中略有不同（怀疑是 TS 的 bug）。
- 2、如果组件中使用了项目的扩展方式，那么其余组件的扩展提示会出现问题。

:::
