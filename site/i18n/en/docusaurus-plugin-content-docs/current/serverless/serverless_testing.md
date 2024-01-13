# Test function

## Functions of HTTP classes

This method is applicable to all functions of HTTP-like triggers, including `HTTP` and `API_GATEWAY`.

Use the same test method as the application to test. For HTTP functions, use the supertest encapsulated `createHttpRequest` method to create HTTP clients.

The only difference from the application is that the `createFunctionApp` method is used to create a function application (app).

`createFunctionApp` is a customized method of `createApp` in the function scenario.

The HTTP test code is as follows:

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/faas';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from api gateway trigger', async () => {
    
    const app: Application = await createFunctionApp<Framework>();
    
    const result = await createHttpRequest(app).get('/').query({
      name: 'zhangting',
    });
    expect(result.text).toEqual('hello zhangting');
    
    await close(app);

  });
});
```

## Ordinary trigger

In addition to HTTP-like triggers, we also have other function triggers such as timers and object storage. Since these triggers are closely related to the gateway, they cannot be tested using HTTP behavior. Instead, they use traditional method calls.

Create a function app through the `createFunctionApp` method, obtain the class instance through the `getServerlessInstance` method, and then call it directly through the instance method and pass in the parameters for testing.

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/faas';

describe('test/hello_aliyun.test.ts', () => {

   it('should get result from event trigger', async () => {
     //Create function app
     let app: Application = await createFunctionApp<Framework>();
    
     // Get the service class
     const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
    
     // Call the function method and pass in parameters
     expect(await instance.handleEvent('hello world')).toEqual('hello world');
    
     await close(app);
   });
});
```

