# Test function

## Functions of HTTP classes

This method is applicable to all functions of HTTP-like triggers, including `HTTP` and `API_GATEWAY`.

Use the same test method as the application to test. For HTTP functions, use the supertest encapsulated `createHttpRequest` method to create HTTP clients.

The only difference from the application is that the `createFunctionApp` method is used to create a function application (app).

The `createFunctionApp` method is the customization of the `createApp` method in the function scenario (which specifies the `@midwayjs/serverless-app` framework of the function).

:::info
Instead of using the `@midwayjs/faas` framework directly, the `@midwayjs/serverless-app` framework is used because the latter contains a series of steps from gateway simulation to function call.
:::

The HTTP test code is as follows:

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';

describe('test/hello_aliyun.test.ts', () => {
  let app: Application;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>();
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from api gateway trigger', async () => {
    const result = await createHttpRequest(app).get('/').query({
      name: 'zhangting',
    });
    expect(result.text).toEqual('hello zhangting');
  });
});
```

## Ordinary trigger

In addition to HTTP-like triggers, we have other function triggers such as timers and object stores. These triggers are closely related to gateways and cannot be tested using HTTP behavior, but are done using traditional method calls.

Create a function app through the `createFunctionApp` method, obtain a class instance through the `getServerlessInstance` method, and then directly call it through the method of the instance, and pass in parameters for testing.

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { createInitializeContext } from '@midwayjs/serverless-fc-trigger';

describe('test/hello_aliyun.test.ts', () => {
  let app: Application;
  let instance: HelloAliyunService;

  beforeAll(async () => {
    // Create function app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext(), // Aliyun-specific initialization context data is passed in here.
    });

    // Get the service class
    instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from event trigger', async () => {
    // Call the function method and pass in the parameters.
    expect(await instance.handleEvent('hello world')).toEqual('hello world');
  });
});
```

## Platform tool class

Midway provides a platform tool class for quickly creating test data.

Existing platform tool classes include:
| @midwayjs/serverless-fc-trigger | Aliyun Trigger Simulation |
| --- | --- |
| @midwayjs/serverless-sfc-trigger | Tencent Cloud Trigger Simulation |

These tool classes provide some methods for quickly creating initialization data.

for example, the alibaba cloud function provides a method to quickly create an initialization context, which can be passed in when initializing the function app.

```typescript
import { createInitializeContext } from '@midwayjs/serverless-fc-trigger';

describe('test/hello_aliyun.test.ts', () => {
  // ...

  beforeAll(async () => {
    // Create function app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext(), // aliyun-specific initialization context data is passed in here.
    });

    // ...
  });
});
```

All tools and methods support data modification, which can be passed in through parameters and merged with the default data. For example, to modify the initialization context data.

```typescript
import { createInitializeContext } from '@midwayjs/serverless-fc-trigger';

describe('test/hello_aliyun.test.ts', () => {
  // ...

  beforeAll(async () => {
    // Create function app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext({
        accountId: 'xxxxxxx', // data can be adjusted according to the structure
      }),
    });

    // ...
  });
});
```

For example, create data for a timed task trigger.

```typescript
import { createTimerEvent } from '@midwayjs/serverless-fc-trigger';

it('should get result from timer trigger', async () => {
  // Get the service class
  const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
  // Call the function method and pass in the parameters.
  await instance.handleTimer(createTimerEvent());
});
```

The `createTimerEvent` method here returns a data structure that matches the platform.

```json
{
  triggerTime: new Date().toJSON()
  triggerName: 'timer',
  payload: '',
}
```

Similarly, we can pass parameters for coverage.

```json
 // Call the function method and pass in the parameters.
await instance.handleTimer(createTimerEvent({
	// ...
});
```

For specific function tool methods, you can consult different platform trigger tests.
