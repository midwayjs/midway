# 扩展上下文定义

在某些场景下，需要扩展上下文 ctx 属性，比如 Web 场景下中间件，我们可以往上附加一些方法或者属性。

```typescript
import { Middleware } from '@midwayjs/decorator';
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
declare module '@midwayjs/core' {
  interface Context {
    abc: string;
  }
}
```

## 组件中扩展定义

组件中略有不同，一般来说，组件可能是只能在特定的场景使用。

你可以在组件根目录的 `index.d.ts` 通过下面的代码，扩展 Midway 通用的 Context。

如果你希望对所有场景的 Context 做扩展。

```typescript
// index.d.ts

// 下面这段可以对所有的 Context 做扩展
declare module '@midwayjs/core' {
  interface Context {
    abc: string;
  }
}
```

如果你只希望对特定场景的 Context 做扩展。

```typescript
// index.d.ts

// 下面这段只 @midwayjs/koa 的 Context 做扩展
declare module '@midwayjs/koa' {
  interface Context {
    abc: string;
  }
}

// 下面这段只 @midwayjs/web 的 Context 做扩展
declare module '@midwayjs/web' {
  interface Context {
    abc: string;
  }
}

// 下面这段只 @midwayjs/faas 的 Context 做扩展
declare module '@midwayjs/faas' {
  interface Context {
    abc: string;
  }
}

// 下面这段只 @midwayjs/express 的 Context 做扩展
declare module '@midwayjs/express' {
  interface Context {
    abc: string;
  }
}

```

