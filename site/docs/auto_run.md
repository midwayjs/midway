# 自执行代码

在初始化过程中，当我们的代码和主流程无关，却想执行的时候，一般会在启动 onReady 阶段来执行，随着的代码量越来越多，onReady 会变的臃肿。

比如，我们有一些需要提前执行的逻辑，一个用于监听 Redis 错误，一个用于初始化数据同步：

```typescript
@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisErrorListener {
  // ...
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class DataSyncListener {
  // ...
}
```

一般，我们会在启动时通过 `getAsync` 方法来创建实例，使其执行。

```typescript


// configuration.ts
//...

@Configuration({
  // ...
})
export class MainConfiguration {
  async onReady(container) {
    await container.getAsync(RedisErrorListerner);
    await container.getAsync(DataSyncListerner);
  }
}

```

这样一旦代码多了，onReady 中会出现许多非必要流程的代码。



## 自初始化

如果代码和主流程不耦合，属于独立的逻辑，比如上述的监听一些事件，初始化数据同步等，就可以使用 @Autoload 装饰器，使某个类可以自初始化。

比如：

```typescript
import { Autoload, Scope, ScopeEnum } from '@midwayjs/decorator';

@Autoload()
@Scope(ScopeEnum.Singleton)
export class RedisErrorListener {
  @Init()
  async init() {
    const redis = new Redis();
    redis.on('xxx', () => {
      // ...
    });
  }
}
```

这样无需在 `onReady` 中使用 `getAsync` 方法即可自动初始化，并执行 init 方法。



