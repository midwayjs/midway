# 缓存

缓存是一个伟大而简单的技术，有助于提高你的应用程序的性能。本组件提供了缓存相关的能力，你可以将数据缓存到不同的数据源，也可以针对不同场景建立多级缓存，提高数据访问速度。

:::tip

Midway 提供基于 [cache-manager v5](https://github.com/node-cache-manager/node-cache-manager) 模块重新封装了缓存组件，原有的缓存模块基于 v3 开发不再迭代，如需查看老文档，请访问 [这里](/docs/extensions/cache)。

:::

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |



## 安装

首先安装相关的组件模块。

```bash
$ npm i @midwayjs/cache-manager@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/cache-manager": "^3.0.0",
    // ...
  },
}
```



## 启用组件


首先，引入组件，在 `configuration.ts` 中导入：

```typescript
import { Configuration } from '@midwayjs/core';
import * as cacheManager from '@midwayjs/cache-manager';
import { join } from 'path'

@Configuration({
  imports: [
    // ...
    cacheManager,
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```



## 使用缓存



### 1、配置缓存

在使用前，你需要配置缓存所在的位置，比如内置的内存缓存，或者是引入 Redis 缓存，每个缓存对应了一个缓存的 Store。

下面的示例代码，配置了一个名为 `default` 的内存缓存。

```typescript
// src/config/config.default.ts
export default {
  cacheManager: {
    clients: {
      default: {
        store: 'memory',
      },
    },
  }
}
```

最常用的场景下，缓存会包含两个参数，配置 `max` 修改缓存的数量，配置 `ttl` 修改缓存的过期时间，单位毫秒。

```typescript
 // src/config/config.default.ts
export default {
  cacheManager: {
    clients: {
      default: {
        store: 'memory',
        options: {
          max: 100,
          ttl: 10,
        },
      },
    },
  }
}
```

:::tip

* `ttl` 的单位是毫秒
* `max` 代表缓存 key 的最大个数
* 不同的 Store 淘汰 key 的算法不同，内存缓存使用的淘汰算法是 LRU

:::

### 2、使用缓存

可以通过服务工厂的装饰器获取到实例，可以通过简单的 `get` 和 `set` 方法获取和保存缓存。

```typescript
import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

@Provide()
export class UserService {

  @InjectClient(CachingFactory, 'default')
  cache: MidwayCache;

  async invoke(name: string, value: string) {
    // 设置缓存
    await this.cache.set(name, value);
    // 获取缓存
    const data = await this.cache.get(name);
    // ...
  }
}

```

动态设置 `ttl` 过期时间。

```typescript
await this.cache.set('key', 'value', 1000);
```

若要禁用缓存过期，可以将 `ttl` 配置属性设置为 0。

```typescript
await this.cache.set('key', 'value', 0);
```

删除单个缓存。

```typescript
await this.cache.del('key');
```

清理整个缓存，可以使用 `reset` 方法。

```typescript
await this.cacheManager.reset();
```

:::danger

注意，清理整个缓存非常危险，如果使用了 Redis 作为缓存 store，将清空整个 Redis 数据。

:::

除了装饰器之外，也可以通过 API 获取缓存实例。

```typescript
import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

@Provide()
export class UserService {

  @Inject()
  cachingFactory: CachingFactory;

  async invoke() {
    const caching = await this.cachingFactory.get('default');
    // ...
  }
}
```



### 3、配置多个缓存

和其他组件一样，组件支持配置多个缓存实例。

```typescript
// src/config/config.default.ts
export default {
  cacheManager: {
    clients: {
      default: {
        store: 'memory',
      },
      otherCaching: {
        store: 'memory',
      }
    },
  }
}
```

可以注入不同的缓存实例。

```typescript
import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

@Provide()
export class UserService {

  @InjectClient(CachingFactory, 'default')
  cache: MidwayCache;
  
  @InjectClient(CachingFactory, 'otherCaching')
  customCaching: MidwayCache;

}

```



### 4、配置不同 Store

组件基于 [cache-manager](https://github.com/node-cache-manager/node-cache-manager) 可以配置不同的缓存 Store，比如最常见的可以配置 Redis Store。

假如项目已经配置了一个 `Redis`，通过组件内置的 `createRedisStore` 方法，可以快速创建一个 Redis Store。


```typescript
import { createRedisStore } from '@midwayjs/cache-manager';

// src/config/config.default.ts
export default {
  cacheManager: {
    clients: {
      default: {
        store: createRedisStore('default'),
        options: {
          ttl: 10,
        }
      },
    },
  },
  redis: {
    clients: {
      default: {
        port: 6379,
        host: '127.0.0.1',
      }
    }
  }
}
```

`createRedisStore` 方法可以传递一个已经配置的 redis 实例名，可以和 redis 组件复用实例。



### 5、配置三方 Store

除了 Redis 之外，用户也可以自行选择 Cache-Manager 的 Store，列表可以参考 [这里](https://github.com/node-cache-manager/node-cache-manager?tab=readme-ov-file#store-engines)。

下面是一个配置  [node-cache-manager-ioredis-yet](https://github.com/node-cache-manager/node-cache-manager-ioredis-yet) 的例子。

```typescript
// src/config/config.default.ts
import { redisStore } from 'cache-manager-ioredis-yet';

export default {
  cacheManager: {
    clients: {
      default: {
        store: redisStore,
        options: {
          port: 6379,
          host: 'localhost',
          ttl: 10,
        },
      },
    },
  }
}
```



### 6、多级缓存

[cache-manager](https://github.com/node-cache-manager/node-cache-manager) 支持将多个缓存 Store 聚合到一起，实现多级缓存。

比如我可以创建一个多级缓存将多个缓存 Store 合并到一起。

```typescript
// src/config/config.default.ts
import { createRedisStore } from '@midwayjs/cache-manager';
export default {
  cacheManager: {
    clients: {
      memoryCaching: {
        store: 'memory',
      },
      redisCaching: {
        store: createRedisStore('default'),
        options: {
          ttl: 10,
        },
      },
      multiCaching: {
        store: ['memoryCaching', 'redisCaching'],
        options: {
          ttl: 100,
        },
      },
    },
  },
  redis: {
    clients: {
      default: {
        port: 6379,
        host: '127.0.0.1',
      },
    },
  },
};

```

这样 `multiCaching` 这个缓存实例就包含了两级缓存，缓存的优先级从上到下，在查找时，会先查找 `memoryCaching` ，如果内存缓存不存在 key，则继续查找 `redisCaching`。



### 7、使用多级缓存

和普通缓存类似，多级缓存除了 `set`、`get`、`del`方法外，还增加了 `mset` 、`mget`、`mdel` 方法。

```typescript
import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayMultiCache } from '@midwayjs/cache-manager';

const userId2 = 456;
const key2 = 'user_' + userId;
const ttl = 5;

@Provide()
export class UserService {

  @InjectClient(CachingFactory, 'multiCaching')
  multiCache: MidwayMultiCache;

  async invoke() {
    // 设置到所有级别的缓存
    await this.multiCache.set('foo2', 'bar2', ttl);

    // 从最高优先级的缓存 Store 中获取 key
    console.log(await this.multiCache.get('foo2'));
    // >> "bar2"

    // 调用每一个 Store 的 del 方法进行删除
    await this.multiCache.del('foo2');

    // 在所有缓存中设置多个 key，可以多个键值对
    await this.multiCache.mset(
      [
        ['foo', 'bar'],
        ['foo2', 'bar2'],
      ],
      ttl
    );

    // mget() 从最高优先级的缓存中获取值
    // 如果第一个缓存 Store 中不包含所有的 key，
    // 继续在下一个缓存 Store 中查找没有找到的 key。
    // 这是递归地完成的，直到:
    // - 所有的 key 都已经查找到值
    // - 所有的缓存 Store 都被查找过
    console.log(await this.multiCache.mget('key', 'key2'));
    // >> ['bar', 'bar2']

    // 调用每一个 Store 的 mdel 方法进行删除
    await this.multiCache.mdel('foo', 'foo2');
  }
}

```

### 8、自动刷新

不管是普通缓存还是多级缓存，都支持后台刷新功能，只需要配置 `refreshThreshold` 的时间，单位为毫秒。

```typescript
// src/config/config.default.ts
export default {
  cacheManager: {
    clients: {
      default: {
        store: 'memory',
        options: {
          refreshThreshold: 3 * 1000,
        },
      },
    },
  }
}
```

如果设置了 `refreshthreshold`，每次从缓存获取值之后，会检查 `ttl` 的值，如果剩余的 `ttl` 小于 `refreshthreshold` ，则系统将异步更新缓存，同时系统会返回旧值，直到 `ttl` 过期。

:::tip

* 在多级缓存的情况下，根据优先级顺序找到第一个包含 key 的 Store。

* 如果阈值较低且执行的函数比较慢，key 可能会过期，有可能会遇到并发更新的情况。

* 后台刷新机制目前只支持单个 key。

* 如果没有为 key 设置 `ttl`，则不会触发刷新机制。对于 redis，`ttl`  默认设置为-1。

:::



## 自动缓存

### 使用装饰器缓存方法

可以通过 `@Caching` 装饰器缓存方法的结果，比如缓存 http 响应或者服务调用的结果。

```typescript
import { Provide } from '@midwayjs/core';
import { Caching } from '@midwayjs/cache-manager';

@Provide()
export class UserService {
  @Caching('default')
  async getUser(name: string) {
    return name;
  }
}

```

当第一次调用 `getUser` 方法时，会正常执行逻辑，返回结果，装饰器会将结果缓存起来，第二次执行时，如果缓存未失效，则会从缓存中直接返回。

### 指定缓存的 ttl

也可以单独设置 `ttl` 。

```typescript
import { Provide } from '@midwayjs/core';
import { Caching } from '@midwayjs/cache-manager';

@Provide()
export class UserService {
  @Caching('default', 100)
  async getUser(name: string) {
    return name;
  }
}
```

### 手动指定缓存 key

如果对自动生成的 key 不满意，可以手动指定缓存的 key。

```typescript
import { Provide } from '@midwayjs/core';
import { Caching } from '@midwayjs/cache-manager';

@Provide()
export class UserService {
  @Caching('default', 'customKey', 100)
  async getUser(name: string) {
    return name;
  }
}
```

### 带逻辑的缓存

如果你希望根据一些特定逻辑进行缓存，比如特定参数，或者特定的 Header，可以传递一个工具函数进行逻辑判断。

```typescript
import { Provide } from '@midwayjs/core';
import { Caching } from '@midwayjs/cache-manager';

function cacheBy({methodArgs, ctx, target}) {
  if (methodArgs[0] === 'harry' || methodArgs[0] === 'mike') {
    return 'cache1';
  }
}

@Provide()
export class UserService {
  @Caching('default', cacheBy, 100)
  async getUser(name: string) {
    return 'hello ' + name;
  }
}
```

上面的示例中，`cacheBy` 方法自定义了缓存的逻辑，当方法入参值为 `harry` 或者 `mike` 时，将返回缓存的 `key` ，而其他参数时则跳过缓存。

这个时候执行的结果为：

```typescript
await userService.getUser('harry'));	// hello harry
await userService.getUser('mike'));	// hello harry
await userService.getUser('lucy'));	// hello lucy
```

`@Caching` 装饰器可以在第二个参数中传递一个方法，这个方法的入参 options 为：

* `methodArgs`  当前调用方法的实际参数
* `ctx` 如果是请求作用域，则是当前调用的上下文对象，如果是单例，则该对象为空对象
* `target` 当前调用的实例

方法的返回值为字符串或者布尔值，当返回字符串时，表示以该 key 将方法的结果缓存，当返回 `undefined` 或者 `null` 时，表示跳过缓存。

通过这些参数判断，我们可以实现非常灵活的自定义缓存逻辑。



## 常见问题



### 1、多进程下内存缓存 set 和 get 无法得到相同值

这是正常现象，每个进程的数据是独立的，仅保存在当前进程中。如需跨进程缓存，请使用 Redis 这类分布式缓存系统。
