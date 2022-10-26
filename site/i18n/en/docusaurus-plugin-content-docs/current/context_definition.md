# Extended context definition

Due to static type analysis of TS, we do not recommend dynamically mounting certain attributes. Dynamic mounting will make it very difficult to process TS types. In some special scenarios, if you need to extend the context ctx attribute, such as the middleware in the Web scenario, we can add some methods or attributes.

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

However, due to the relationship between TypeScript module definitions, we cannot attach definitions to existing modules, so we used a new method to expand.




## Extended definition in project


You can extend Midway's common Context in the project through the following code in `src/interface.ts`.

```typescript
// src/interface.ts

import '@midwayjs/core';

// ...

declare module '@midwayjs/core'{
  interface Context {
    abc: string;
  }
}
```

:::info

Note that `declare module` replaces the original definition, so please import the module using `import` syntax before operating.

:::



## Extension definition in component

Components are slightly different. Generally speaking, components may only be used in specific scenarios.

You can extend Midway's common Context through the following code in `index.d.ts` of the component root directory.

If you want to expand the Context of all scenes.

```typescript
// index.d.ts

// The following paragraph can extend all Context
declare module '@midwayjs/core/dist/interface '{
  interface Context {
    abc: string;
  }
}
```

If you only want to expand the Context of a specific scene.

```typescript
// index.d.ts

// The following paragraph is only extended by the Context of @midwayjs/koa
declare module '@midwayjs/koa/dist/interface '{
  interface Context {
    abc: string;
  }
}

// The following paragraph is only extended by @midwayjs/Web Context
declare module '@midwayjs/web/dist/interface '{
  interface Context {
    abc: string;
  }
}

// The following paragraph is only extended by the Context of @midwayjs/faas
declare module '@midwayjs/faas/dist/interface '{
  interface Context {
    abc: string;
  }
}

// The following paragraph is only extended by @midwayjs/express Context
declare module '@midwayjs/express/dist/interface '{
  interface Context {
    abc: string;
  }
}

```

:::caution
- 1. The extension in the component is slightly different from that in the project (it is suspected to be a bug of TS).
- 2. If the extension method of the project is used in the component, there will be problems with the extension prompts of the remaining components.

:::
