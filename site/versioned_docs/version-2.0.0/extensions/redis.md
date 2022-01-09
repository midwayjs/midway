---
title: Redis
---

这里介绍如何快速在 Midway 中使用 Redis。

## 安装依赖

`@midwayjs/redis` 是主要的功能包，`@types/ioredis` 是 定义包。

```bash
$ npm i @midwayjs/redis --save
$ npm i @types/ioredis --save-dev			// 安装到 dev 依赖
```

如果发现 RedisService 没有方法定义，请务必检查此项。
​

## 引入组件

首先，引入 组件，在 `src/configuration.ts`  中导入：

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as redis from '@midwayjs/redis';
import { join } from 'path';

@Configuration({
  imports: [
    redis, // 导入 redis 组件
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerLifeCycle {}
```

## 配置 Redis

比如：
​

**单客户端配置**

```typescript
// src/config.default

// Single Redis
export const redis = {
  client: {
    port: 6379, // Redis port
    host: '127.0.0.1', // Redis host
    password: 'auth',
    db: 0,
  },
};
```

**Sentinel 配置**

```typescript
export const redis = {
  client: {
    sentinels: [
      {
        // Sentinel instances
        port: 26379, // Sentinel port
        host: '127.0.0.1', // Sentinel host
      },
    ],
    name: 'mymaster', // Master name
    password: 'auth',
    db: 0,
  },
};
```

**Cluster 模式配置，需要配置多个**

```typescript
// Cluster Redis
export const redis = {
  client: {
  	cluster: true,
    nodes: [{
      host: 'host',
      port: 'port',
      password: 'password',
      db: 'db',
    },{
      host: 'host',
      port: 'port',
      password: 'password',
      db: 'db',
    },
  }
};
```

**​**

**多个客户端配置，需要配置多个**

```typescript
// Multi Redis
export const redis = {
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
};
```

更多参数可以查看 [ioredis 文档](https://github.com/luin/ioredis/blob/master/API.md#new_Redis_new)。
​

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
    await this.redisService.set('foo', 'bar');
    const result = await this.redisService.get('foo');

    // result => bar
  }
}
```

​

可以使用 `RedisServiceFactory` 获取不同的实例。

```typescript
import { RedisServiceFactory } from '@midwayjs/redis';
import { join } from 'path';

@Provide()
export class UserService {
  @Inject()
  redisServiceFactory: RedisServiceFactory;

  async save() {
    const redis1 = await this.redisServiceFactory.get('instance1');
    const redis2 = await this.redisServiceFactory.get('instance3');

    //...
  }
}
```
