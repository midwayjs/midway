# 数据订阅

在某些场景下，我们希望订阅某个数据，并且在一段时间后更新它，这种类似订阅的方式，我们称之为 ”数据订阅“，常见的远程数据获取等，都可以应用这个模式。

Midway 提供了 `DataListener` 的抽象，用于方便的创建这种模式的代码。

## 实现数据订阅

我们以一个简单的 **内存数据更新** 的需求为例。

数据订阅在 midway 中也是一个普通的类，比如我们也可以把他放到 `src/listener/memory.listner.ts` 中。

我们只需要继承内置的 `DataListener` 类，同时，一般数据订阅类为单例。

`DataListener` 包含一个泛型类型，需要声明该数据订阅返回的数据类型。

比如：

```typescript
// src/listener/memory.listner.ts
import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { DataListener } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MemoryDataListener extends DataListener<string> {
  // 初始化数据
  initData() {
    return 'hello' + Date.now();
  }

  // 更新数据
  onData(setData) {
    setInterval(() => {
      setData('hello' + Date.now());
    }, 1000);
  }
}
```

`DataListener` 类有两个必须实现的方法：

- `initData` 数据的初始化方法
- `onData` 数据订阅更新的方法

示例中，我们初始化了数据，同时实现了数据更新的方法，每隔 1 秒钟，我们会使用 `setData` 来更新内置的数据。

此外，大部分的数据订阅会使用到定时器，或者其他外部的 sdk，我们需要考虑好关闭和清理资源的情况。

代码中提供了 `destroyListener` 方法来处理。

比如上面的示例代码，我们需要关闭定时器。

```typescript
// src/listener/memory.listner.ts
import { Provide, Scope, ScopeEnum, DataListener } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MemoryDataListener extends DataListener<string> {
  private intervalHandler;

  // 初始化数据
  initData() {
    return 'hello' + Date.now();
  }

  // 更新数据
  onData(setData) {
    this.intervalHandler = setInterval(() => {
      setData('hello' + Date.now());
    }, 1000);
  }

  // 清理资源
  async destroyListener() {
    // 关闭定时器
    clearInterval(this.intervalHandler);
    // 其他清理, close sdk 等等
  }

}
```

上面的 `initData` 方法可以异步获取数据。

```typescript
// ...
export class MemoryDataListener extends DataListener<string> {
  async initData() {
    // ...
  }
}
```



## 使用数据订阅

我们可以在任意的代码中使用它，在业务中通过 `getData` 方法来获取当前的数据，不需要考虑数据变化的情况。

比如：

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

数据订阅模式可以方便的将变化的数据隐藏在普通类中，而透出不变化的 API，使得标准的业务代码在逻辑和流程上都变的简洁。
