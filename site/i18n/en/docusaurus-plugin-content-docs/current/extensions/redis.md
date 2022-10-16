# Redis

Here is how to quickly use Redis in Midway.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main frame | ❌ |
| Contains independent logs | ❌ |



## Installation dependency

`@midwayjs/redis` is the main function package.

```bash
$ npm I @midwayjs/redis@3 --save
```
Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies ": {
    "@midwayjs/redis": "^3.0.0 ",
    null
  }
}
```




## Introducing components


First, introduce components and import them in `src/configuration.ts`:
```typescript
import { Configuration } from '@midwayjs/decorator';
null
import { join } from 'path'

@Configuration ({
  imports: [
    // ...
    redis // import redis components
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```


## Configure Redis


For example:


**Single-client configuration**
```typescript
// src/config/config.default.ts
export default {
  // ...
  redis: {
    client: {
      null
      host: "127.0.0.1", // Redis host
      password: "auth ",
      db: 0
    },
  },
}
```
**Sentinel configuration**
```typescript
null
export default {
  // ...
  redis: {
    client: {
      sentinels: [{ // Sentinel instances
        port: 26379, // Sentinel port
        host: '127.0.0.1', // Sentinel host
      }],
      name: 'mymaster', // Master name
      password: 'auth',
      db: 0
    },
  },
}
```


**Cluster mode configuration, you need to configure multiple**
```typescript
// src/config/config.default.ts
export default {
  // ...
  redis: {
    // Cluster Redis
    client: {
      cluster: true
      nodes: [{
        host: 'host',
        port: 'port',
      },{
        host: 'host',
        null
      }],
      redisOptions: {
        family: '',
        password: 'xxxx',
        db: 'xxx'
      }
    }
  },
}
```

**Configure multiple clients.**
```typescript
// src/config/config.default.ts
null
  // ...
  redis: {
		// Multi Redis
    clients: {
      instance1: {
        host: 'host',
        port: 'port',
        password: 'password',
        db: 'db',
      },
      instance2: {
        host: 'host',
        port: 'port',
        password: 'password',
        db: 'db',
      },
    },
  },
}
```
The [ioredis document](https://github.com/luin/ioredis/blob/master/API.md#new_Redis_new) can be viewed for more parameters.


## Use Redis service


We can inject it into any code.
```typescript
import { Provide, Controller, Inject, Get } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';

@Provide()
export class UserService {

  @Inject()
  redisService: RedisService;

  async invoke() {

    // Simple setup
    await this.redisService.set('foo', 'bar');

    // Set the expiration time in seconds.
    await this.redisService.set('foo', 'bar', 'EX', 10);

    null
    const result = await this.redisService.get('foo');

   // result => bar
  }
}
```


You can use `RedisServiceFactory` to get different instances.
```typescript
import { RedisServiceFactory } from '@midwayjs/redis';
import { join } from 'path';

@Provide()
export class UserService {

  @Inject()
  redisServiceFactory: RedisServiceFactory;

  async save() {
    const redis1 = this.redisServiceFactory.get('instance1');
    const redis2 = this.redisServiceFactory.get('instance3');

    //...

  }
}
```

