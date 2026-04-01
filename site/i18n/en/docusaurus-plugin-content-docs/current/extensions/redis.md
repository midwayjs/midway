# Redis

Here is how to quickly use Redis in Midway.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ✅ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |



## Installation dependency

`@midwayjs/redis` is the main function package.

```bash
$ npm i @midwayjs/redis@4 --save
```
Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/redis": "^4.0.0",
    // ...
  }
}
```




## Introducing components


First, introduce components and import them in `src/configuration.ts`:
```typescript
import { Configuration } from '@midwayjs/core';
import * as redis from '@midwayjs/redis';
import { join } from 'path';

@Configuration({
  imports: [
    // ...
    redis // import redis components
  ],
  importConfigs: [
    join(__dirname, 'config')
  ],
})
export class MainConfiguration {
}
```


## Configure Redis


**Single-client configuration**
```typescript
// src/config/config.default.ts
export default {
  // ...
  redis: {
    client: {
      port: 6379, // Redis port
      host: "127.0.0.1", // Redis host
      password: "auth ",
      db: 0
    },
  },
}
```
**Sentinel configuration**
```typescript
// src/config/config.default.ts
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
        port: 'port',
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
export default {
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
import { Provide, Controller, Inject, Get } from '@midwayjs/core';
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

    // get data
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

It can also be obtained through decorators.

```typescript
import { RedisServiceFactory, RedisService } from '@midwayjs/redis';
import { InjectClient } from '@midwayjs/core';

@Provide()
export class UserService {

  @InjectClient(RedisServiceFactory, 'instance1')
  redis1: RedisService;

  @InjectClient(RedisServiceFactory, 'instance3')
  redis2: RedisService;

  async save() {
    //...
  }
}
```


## Service Discovery

Midway provides a unified abstract service discovery capability. While Redis is not typically used as a registration center, its pub/sub capability can be leveraged. We implement Redis as a service discovery client.

Service discovery includes service registration and service retrieval.


### Configure service discovery

Configure at least one client; if multiple clients exist, specify the one used for discovery via `serviceDiscoveryClient`.

Set discovery options via `serviceDiscovery`:

```typescript
// src/config/config.default.ts
export default {
  redis: {
    clients: {
      default: {
        host: '127.0.0.1',
        port: 6379
      }
    },
    serviceDiscovery: {
      prefix: 'services:',
      ttl: 30,
      scanCount: 100
    }
  }
}
```

### Register a service

Register the current service to Redis after startup:

```typescript
import { Configuration, Inject } from '@midwayjs/core';
import { RedisServiceDiscovery } from '@midwayjs/redis';

@Configuration({})
export class MainConfiguration {
  @Inject()
  redisDiscovery: RedisServiceDiscovery;

  async onServerReady() {
    const client = this.redisDiscovery.createClient();

    await client.register({
      serviceName: 'order',
      id: client.defaultMeta.id,
      host: client.defaultMeta.host,
      port: 7001,
      ttl: 30,
      meta: { version: '1.0.0' }
    });
    // default is online after register; no explicit online needed
  }
}
```

Notes: When online, the instance key is written and TTL is set; the client periodically refreshes TTL to stay alive. Offline deletes the instance key and stops refreshing; deregister publishes a change message for listeners to refresh.


### Get available services

Fetch available instances or select one via the load balancer:

````typescript
@Provide()
export class OrderService {
  @Inject()
  redisDiscovery: RedisServiceDiscovery;

  async getService() {
    const instances = await this.redisDiscovery.getInstances('order');
    const one = await this.redisDiscovery.getInstance('order');
    return { instances, one };
  }
}
````

Returned instances are the objects written during registration, typically including `serviceName/id/host/port/ttl/meta/tags/status` fields.
