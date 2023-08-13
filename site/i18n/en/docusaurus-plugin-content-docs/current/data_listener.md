# Data subscription

In some scenarios, we want to subscribe to a certain data and update it after a period of time. This kind of subscription-like method, which we call "data subscription", common remote data acquisition, etc., can apply this mode.

Midway provides `DataListener` abstractions to easily create code for this pattern.

## Realize data subscription

Let's take a simple **memory data update** requirement as an example.

Data subscription is also a common class in midway. For example, we can also put it in `src/listener/memory.listner.ts`.

We only need to inherit the built-in `DataListener` class, and at the same time, the general data subscription class is singleton.

`DataListener` contains a generic type, you need to declare the data type returned by the data subscription.

For example:

```typescript
// src/listener/memory.listner.ts
import { DataListener, Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MemoryDataListener extends DataListener<string> {
  // Initialize data
  initData() {
    return 'hello' + Date.now();
  }

  // Update data
  onData(setData) {
    setInterval(() => {
      setData('hello' + Date.now());
    }, 1000);
  }
}
```

`DataListener` class has two methods that must be implemented:

- Initialization method of `initData` data
- `onData`

In the example, we initialize the data and implement the data update method. Every 1 second, we use `setData` to update the built-in data.

In addition, most data subscriptions use timers or other external SDKs. We need to consider shutting down and cleaning up resources.

`destroyListener` methods are provided in the code to handle.

For example, in the above sample code, we need to turn off the timer.

```typescript
// src/listener/memory.listner.ts
import { DataListener, Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MemoryDataListener extends DataListener<string> {
  private intervalHandler;

  // Initialize data
  initData() {
    return 'hello' + Date.now();
  }

  // Update data
  onData(setData) {
    this.intervalHandler = setInterval(() => {
      setData('hello' + Date.now());
    }, 1000);
  }

  // Clean up resources
  async destroyListener() {
    // Turn off timer
    clearInterval(this.intervalHandler);
    // Other cleanup, close sdk, etc
  }

}
```

The `initData` method above can fetch data asynchronously.

```typescript
// ...
export class MemoryDataListener extends DataListener<string> {
  async initData() {
    // ...
  }
}
```



## Use data subscription

We can use it in any code to obtain the current data through `getData` methods in the business without considering the data changes.

For example:

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { MemoryDataListener } from '../listener/memory.listner.ts';

@Provide()
export class UserService {

  @Inject()
  memoryDataListener: MemoryDataListener;

  async getUserHelloData() {
    const helloData = this.memoryDataListener.getData();
    // helloData => helloxxxxxxxx
    // ...
  }
}
```

The data subscription mode can easily hide the changed data in the common class, and reveal the unchanged API, making the standard business code in the logic and process of the concise.
