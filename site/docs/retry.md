# 重试机制

从 Midway v3.5.0 开始，支持方法自定义重试逻辑。

很多时候，我们在某些容易失败，或者异步的方法调用上，需要多次使用 `try` 去包裹函数，同时处理错误。

比如：

```typescript
// 定义了一个异步函数

async function invoke(id) {

  // 一些远程调用逻辑

}


async invokeNew() {
  let error;
  try {
    return await invoke(1);
  } catch(err) {
    error = err;
  }

  try {
    return await invoke(2);
  } catch(err) {
    error = err;
  }

  if (error) {
    // ....
  }
}
```

我们可能会尝试多次调用 `invoke`执行，同时配合 try/catch 的异常捕获，导致业务代码写起来重复且冗长。



## 定义重试函数

我们可以使用 `retryWithAsync`方法进行包裹，简化整个流程。

```typescript
import { retryWithAsync } from '@midwayjs/core';

async function invoke() {
  // 默认调用，加上重试两次，最多执行三次
  const invokeNew = retryWithAsync(invoke, 2);
  
  try {
    return await invokeNew(1);
  } catch(err) {

    // err
  }
}
```

包裹后的方法参数和返回值，和原有方法完全一致。

当在重试周期内调用成功，未抛出错误，则会将成功的返回值返回。

如果失败，则会抛出 `MidwayRetryExceededMaxTimesError` 异常。

如果在类中使用，可能要注意 `this` 的指向。

示例如下：

```typescript
import { retryWithAsync } from '@midwayjs/core';

export class UserService() {
  
  async getUserData(userId: string) {
    // wrap
    const getUserDataOrigin = retryWithAsync(
      this.getUserDataFromRemote, 
      2,
      {
        receiver: this,
      }
    );

    // invoke
    return getUserDataOrigin(userId);
  }
  
  async getUserDataFromRemote(userId: string) {
    // get data from remote
  }
}
```



## this 绑定

从 Midway v3.5.1 起，增加了一个 `receiver` 参数，用于在类的场景下绑定 this，用于处理：

- 1、方法正确的 this 指向
- 2、包裹方法定义的正确性

```typescript
// wrap
const getUserDataOrigin = retryWithAsync(
  this.getUserDataFromRemote, 
  2,
  {
    receiver: this,	// 此参数用于处理 this 指向
  }
);
```

如果没有该参数，代码需要写成下面的样子才能绑定 this，同时返回的 `getUserDataOrigin` 方法的定义才正确。

```typescript
// wrap
const getUserDataOrigin = retryWithAsync(
  this.getUserDataFromRemote.bind(this) as typeof this.getUserDataFromRemote, 
  2,
  {
    receiver: this,
  }
);


```





## 重试次数

`retryWithAsync` 提供了第二个参数，用于声明额外的重试次数，默认为 1（仅重试一次）。

这个值指代的是在默认调用后，额外重试的次数。



## 同步的重试

和 `retryWithAsync` 类似，我们也提供了 `retryWith` 这个同步方法，参数和 `retryWithAsync` 几乎相同，不再额外描述。



## 重试延迟

为了避免频繁重试对服务端造成压力，可以设置重试的间隔。

比如：

```typescript
const invokeNew = retryWithAsync(invoke, 2, {
  retryInterval： 2000，	// 执行失败后，2s 后继续重试
});
```

:::tip

同步方法 `retryWith` 没有该属性。

:::



## 抛出的错误

默认情况下，如果超过重试次数，则会抛出 `MidwayRetryExceededMaxTimesError` 异常。

`MidwayRetryExceededMaxTimesError` 是框架默认的异常，可以进行错误过滤器的捕获梳理，或者从其属性中拿到原始的异常进行处理。

```typescript
import { retryWithAsync, MidwayRetryExceededMaxTimesError } from '@midwayjs/core';

async function invoke() {
  // 默认调用，加上重试两次，最多执行三次
  const invokeNew = retryWithAsync(invoke, 2);
  
  try {
    return await invokeNew(1);
  } catch(err) {
    // err.name === 'MidwayRetryExceededMaxTimesError'
    // err.cause instanceof CustomError => true
  }

}

async invokeNew() {
  throw new CustomError('customError');
}
```

如果希望直接抛出原始的 error 对象，可以通过配置参数。

比如：

```typescript
const invokeNew = retryWithAsync(invoke, 2, {
  throwOriginError： true,
});
```

