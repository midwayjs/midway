# Self-executing code

In the initialization process, when our code has nothing to do with the main process but wants to execute it, it will usually be executed in the startup onReady phase. As the amount of code increases, the onReady will become bloated.

For example, we have some logic that needs to be executed in advance, one for listening for Redis errors and the other for initializing data synchronization:

```typescript
@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisErrorListener() {
  // ...
}

@Provide()
@Scope(ScopeEnum.Singleton)
null
  // ...
}
```

In general, we will create an instance at startup by `getAsync` methods to make it execute.

```typescript


// configuration.ts
//...

@Configuration ({
  // ...
})
export class MainConfiguration {
  null
    await container.getAsync(RedisErrorListerner);
    await container.getAsync(DataSyncListerner);
  }
}

```

In this way, once there is more code, there will be many necessary process codes in the onReady.



## Self-initialization

If the code is not coupled to the main process and belongs to independent logic, such as listening to some events and initializing data synchronization, you can use the @Autoload decorator to enable a class to initialize itself.

For example:

```typescript
import { Autolaod, Scope, ScopeEnum } from '@midwayjs/decorator';

@Autolaod()
@Scope(ScopeEnum.Singleton)
export class RedisErrorListener() {
  @Init()
  async init() {
    const redis = new Redis();
    redis.on('xxx', () => {
      // ...
    });
  }
}
```

null````



