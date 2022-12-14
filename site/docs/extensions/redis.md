# Redis

这里介绍如何快速在 Midway 中使用 Redis。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |



## 安装依赖

`@midwayjs/redis` 是主要的功能包。

```bash
$ npm i @midwayjs/redis@3 --save
```
或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/redis": "^3.0.0",
    // ...
  }
}
```




## 引入组件


首先，引入 组件，在 `src/configuration.ts` 中导入：
```typescript
import { Configuration } from '@midwayjs/decorator';
import * as redis from '@midwayjs/redis';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    redis		// 导入 redis 组件
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```


## 配置 Redis


比如：


**单客户端配置**
```typescript
// src/config/config.default.ts
export default {
  // ...
  redis: {
    client: {
      port: 6379, // Redis port
      host: "127.0.0.1", // Redis host
      password: "auth",
      db: 0,
    },
  },
}
```
**Sentinel 配置**
```typescript
// src/config/config.default.ts
export default {
  // ...
  redis: {
    client: {
      sentinels: [{          // Sentinel instances
        port: 26379,         // Sentinel port
        host: '127.0.0.1',   // Sentinel host
      }],
      name: 'mymaster',      // Master name
      password: 'auth',
      db: 0
    },
  },
}
```


**Cluster 模式配置，需要配置多个**
```typescript
// src/config/config.default.ts
export default {
  // ...
  redis: {
    // Cluster Redis
    client: {
      cluster: true,
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

**多个客户端配置，需要配置多个**
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
更多参数可以查看 [ioredis 文档](https://github.com/luin/ioredis/blob/master/API.md#new_Redis_new)。


## 使用 Redis 服务


我们可以在任意的代码中注入使用。
```typescript
import { Provide, Controller, Inject, Get } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';

@Provide()
export class UserService {

  @Inject()
  redisService: RedisService;

  async invoke() {

    // 简单设置
    await this.redisService.set('foo', 'bar');

    // 设置过期时间，单位秒
    await this.redisService.set('foo', 'bar', 'EX', 10);

    // 获取数据
    const result = await this.redisService.get('foo');

   // result => bar
  }
}
```


可以使用 `RedisServiceFactory` 获取不同的实例。
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

也可以通过装饰器获取。

```typescript
import { RedisServiceFactory } from '@midwayjs/redis';
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

