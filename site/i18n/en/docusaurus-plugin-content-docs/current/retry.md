# Retryable

Starting from Midway v3.5.0, method custom retry logic is supported.

Many times, we need to use `try` multiple times to wrap the function and handle errors on some method calls that are prone to failure or asynchronous.

For example:

```typescript
// Defines an asynchronous function

async function invoke(id) {

  // Some remote call logic

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

You may try to call the `invoke` operation multiple times and use the try/catch to catch exceptions, resulting in repeated and lengthy business code writing.



## Define retry functions

We can use `retryWithAsync` method to package and simplify the whole process.

```typescript
import { retryWithAsync } from '@midwayjs/core';

async function invoke() {
  // The default call, plus two retries, can be executed up to three times.
  const invokeNew = retryWithAsync(invoke, 2);

  try {
    return await invokeNew(1);
  } catch(err) {

    // err
  }
}
```

The method parameters and return values after the package are exactly the same as the original method.

When the call is successful within the retry period and no error is thrown, the successful return value will be returned.

If it fails, the `MidwayRetryExceededMaxTimesError` exception will be thrown.

If it is used in a class, you may need to pay attention to the point of `this`.

Examples are as follows:

```typescript
import { retryWithAsync } from '@midwayjs/core';

export class UserService {

  async getUserData(userId: string) {
    // wrap
    const getUserDataOrigin = retryWithAsync(
      this.getUserDataFromRemote,
      2,
      {
        receiver: this
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



## This binding

Starting from Midway v3.5.1, a `receiver` parameter has been added to bind this in the scene of the class for processing:

- 1, the method of correct this point
- 2, the correctness of the definition of the package method.

```typescript
// wrap
const getUserDataOrigin = retryWithAsync(
  this.getUserDataFromRemote,
  2,
  {
    receiver: this, // This parameter is used to handle this pointing
  }
);
```

If there is no such parameter, the code needs to be written as follows to bind this, and the definition of the `getUserDataOrigin` method returned is correct.

```typescript
// wrap
const getUserDataOrigin = retryWithAsync(
  this.getUserDataFromRemote.bind(this) as typeof this.getUserDataFromRemote,
  2,
  {
    receiver: this
  }
);


```





## Number of retries

The `retryWithAsync` provides a second parameter to declare the additional number of retries, which defaults to 1 (only retry once).

This value refers to the number of additional retries after the default call.



## Retry of synchronization

Similar to `retryWithAsync`, we also provide `retryWith` synchronization method, the parameters and `retryWithAsync` are almost the same, no additional description.



## Retry delay

To prevent frequent retries from putting pressure on the server, you can set the retry interval.

For example:

```typescript
const invokeNew = retryWithAsync(invoke, 2, {
  retryInterval: 2000, //After the execution fails, continue to try again after 2s.
});
```

:::tip

The synchronization method `retryWith` does not have this attribute.

:::



## Error thrown

By default, if the number of retries is exceeded, the `MidwayRetryExceededMaxTimesError` exception is thrown.

The `MidwayRetryExceededMaxTimesError` is the default exception of the framework, which can be captured and combed by the error filter, or the original exception can be handled from its attributes.

```typescript
import { retryWithAsync, MidwayRetryExceededMaxTimesError } from '@midwayjs/core';

async function invoke() {
  // The default call, plus two retries, can be executed up to three times.
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

If you want to throw the original error object directly, you can configure the parameters.

For example:

```typescript
const invokeNew = retryWithAsync(invoke, 2, {
  throwOriginError: true
});
```

