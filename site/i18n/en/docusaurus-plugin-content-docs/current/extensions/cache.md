# Cache

Midway Cache is a component that facilitates developers to perform caching operations, and it is beneficial to improve the performance of the project. It provides us with a data center for efficient data access.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |


## Installation

First install the relevant component modules.

```bash
$ npm i @midwayjs/cache@3 cache-manager --save
$ npm i @types/cache-manager --save-dev
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/cache": "^3.0.0",
    "cache-manager": "^3.4.1 ",
    // ...
  },
  "devDependencies": {
    "@types/cache-manager": "^3.4.0 ",
    // ...
  }
}
```



## Use Cache

Midway provides a unified API for different cache stores. By default, a data center based on memory data storage is built in. If you want to use another data center, developers can also switch to modes such as mongodb and fs.


First, the Cache component is introduced and imported in the `configuration.ts`:

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import * as cache from '@midwayjs/cache';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    cache // import cache component
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```

It can then be injected into the business code.

```typescript
import { Inject, Provide } from '@midwayjs/decorator';
import { IUserOptions } from '../interface';
import { CacheManager } from '@midwayjs/cache';

@Provide()
export class UserService {

  @Inject()
  cacheManager: CacheManager;     			// inject CacheManager
}
```

Set through the provided API to obtain cached data.


```typescript
import { Inject, Provide } from '@midwayjs/decorator';
import { IUserOptions } from '../interface';
import { CacheManager } from '@midwayjs/cache';

@Provide()
export class UserService {

  @Inject()
  cacheManager: CacheManager;

  async getUser(options: IUserOptions) {
    // Set cache content
    await this.cacheManager.set('name', 'stone-jin');

    // Get cached content
    let result = await this.cacheManager.get('name');

    return result;
  }

  async getUser2() {
    // Get cached content
    let result = await this.cacheManager.get('name');
    return result;
  }

  async reset() {
    Await this.cacheManager.reset(); // Clear the contents of the corresponding store
  }
}
```



### Set cache


You can use the `await this.cache.set(key, value)` method to set this parameter. The default expiration time is 10s.


You can also manually set TTL (Expiration Time), as follows:
```typescript
Await this.cacheManager.set(key, value, {ttl: 1000}); // ttl is in seconds
```
If you want to prohibit Cache from expiring, set TTL to null.
```typescript
await this.cacheManager.set(key, value, {ttl: null});
```
At the same time, you can also set it through the global `config.default.ts`.
```typescript
export default {
  // ...
  cache: {
    store: 'memory',
    options: {
      max: 100
      Ttl: 10, // Modify the default ttl configuration
    },
  }
}
```


### Get cache

```typescript
const value = await this.cacheManager.get(key);
```
If not, undefined.



### Remove cache


To remove the cache, you can use the del method.
```typescript
await this.cacheManager.del(key);
```



### Empty the overall store data (here is the overall clear, need to focus on⚠)


For example, if the user sets a redis as store, the call will be cleared, including those set by non-cache modules.
```typescript
await this.cacheManager.reset(); // This piece needs attention
```



## Global configuration


When we refer to this cache component, we can configure it globally. The configuration method is similar to other components.


Default configuration:
```typescript
export default {
  // ...
  cache: {
  	store: 'memory',
    options: {
      max: 100
      ttl: 10
    },
  }
}
```
For example, users can modify the default TTL, that is, the expiration time.



## Other Cache


You can also modify the store method to configure components in `config.default.ts`:
```typescript
import * as redisStore from 'cache-manager-ioredis';

export default {
  // ...
  cache: {
  	store: redisStore
    options: {
      host: 'localhost', // default value
      port: 6379, // default value
      password: '',
      db: 0
      keyPrefix: 'cache :',
      ttl: 100
    },
  }
}
```
Or modify it to the mongodb cache.


:::danger
**note again⚠️: When using redis as cache, the reset method is used with caution in the code, because the entire redis will be flushdb, or the data will be cleared for short. **
:::



## Related documents


Because Midway Cache is based on cache-manager encapsulation, users can also query [cache-manger](https://www.npmjs.com/package/cache-manager).



## Frequently Asked Questions



### 1. Can set and get not get the same value?

The user uses the cache module, which is in memory by default. For example, the dev mode is used locally. Since it is single-process, the set and ge t can eventually reach the same value. However, after the user is deployed to the server, there will be many workers, which is equivalent to the first request, falling on process 1, and then falling on process 2 for the second time, thus getting empty.


Solution: Refer to other cache sections to configure the store to be distributed, such as the store for redis.
