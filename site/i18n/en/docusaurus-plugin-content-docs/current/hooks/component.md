# Using Midway Components

Midway provides a series of components, including Cache / Http / Redis, etc.
In Midway Hooks, we can directly use Midway components to quickly implement functions.

## Introducing components

Midway Hooks uses `createConfiguration()` in `configuration.ts` to configure the project, and its Api is consistent with the `@Configuration()` provided by `@midwayjs/decorator`.

Take the `@midwayjs/cache` component as an example:

```ts
import {
  createConfiguration
  hooks
} from '@midwayjs/hooks';
import * as Koa from '@midwayjs/koa';
import { join } from 'path';
import * as cache from '@midwayjs/cache';

export default createConfiguration({
  imports: [cache, Koa, Hooks()]
  importConfigs: [
    join(__dirname, 'config')
  ],
});
```

You can import components through `imports` and `importConfigs` configuration files.

## Use components

In `@midwayjs/cache`, `CacheManager` classes are provided to operate the cache.

In Midway Hooks, you can get instances of classes at runtime through the `useInject(class)` provided by `@midwayjs/hooks`.

```ts
import {
  Api
  Get
  useInject
} from '@midwayjs/hooks';
import { CacheManager } from '@midwayjs/cache';

export default Api(Get(), async () => {
  const cache = await useInject (
    CacheManager
  );

  await cache.set('name', 'Midway');
  const result = await cache.get (
    'name'
  );

  return 'Hello ${result}!';
});
```

The `useInject(CacheManager)` here is the same as the function of `@Inject() cache: CacheManager`.
