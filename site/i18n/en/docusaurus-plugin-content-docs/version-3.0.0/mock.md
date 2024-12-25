# Data simulation

Midway provides the built-in ability to simulate data during development and testing.



## Mock during testing

`@midwayjs/mock` provides some more general APIs for simulation during testing.

### Simulation context

`mockContext` methods are used to simulate the context.

```typescript
import { mockContext } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  // Simulation context
  mockContext(app, 'user', 'midway');

  const result1 = await createHttpRequest(app).get('/');
  // ctx.user => midway
  // ...
});
```

If your data is complex or logical, you can also use the callback form.

```typescript
import { mockContext } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  // Simulation context
  mockContext(app, (ctx) => {
    ctx.user = 'midway';
  });
});
```

Note that this mock behavior is executed before all middleware.



### Analog Session

`mockSession` methods are used to simulate Session.

```typescript
import { mockSession } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  mockSession(app, 'user', 'midway');

  const result1 = await createHttpRequest(app).get('/');
  // ctx.session.user => midway
  // ...
});
```

### Simulate Header

Use `mockHeader` methods to simulate Header.

```typescript
import { mockHeader } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  mockHeader(app, 'x-abc', 'bbb');

  const result1 = await createHttpRequest(app).get('/');
  // ctx.headers['x-abc'] => bbb
  // ...
});
```

### Simulation class attribute

Use the `mockClassProperty` method to simulate the properties of the class.

If there is the following service class.

```typescript
@Provide()
export class UserService {
  data;

  async getUser() {
    return 'hello';
  }
}
```

We can simulate it when we use it.

```typescript
import { mockClassProperty } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {

  mockClassProperty(UserService, 'data', {
    bbb: 1
  });
  // userService.data => {bbb: 1}

  // ...
});
```

It is also possible to simulate the method.

```typescript
import { mockClassProperty } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {

  mockClassProperty(UserService, 'getUser', async () => {
    return 'midway';
  });

  // userService.getUser() => 'midway'

  // ...
});
```



### Simulate common object properties

Use the `mockProperty` method to mock object properties.

```typescript
import { mockProperty } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {

  const a = {};
  mockProperty(a, 'name', 'hello');

  // a['name'] => 'hello'

  // ...
});
```

It is also possible to simulate the method.

```typescript
import { mockProperty } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {

  const a = {};
  mockProperty(a, 'getUser', async () => {
    return 'midway';
  });

  // a.getUser() => 'midway'

  // ...
});
```



### Grouping

Starting from version `3.19.0`, Midway's mock functionality supports managing different mock data through grouping. You can specify a group name when creating a mock, allowing you to restore or clean up a specific group of mock data as needed.

```typescript
import { mockContext, restoreMocks } from '@midwayjs/mock';

it('should test mock with groups', async () => {
  const app = await createApp();

  // Create a mock for a regular object
  const a = {};
  mockProperty(a, 'getUser', async () => {
    return 'midway';
  }, 'group1');

  // Create a mock for the context
  mockContext(app, 'user', 'midway', 'group1');
  mockContext(app, 'role', 'admin', 'group2');

  // Restore a single group
  restoreMocks('group1');

  // Restore all groups
  restoreAllMocks();
});
```

By using groups, you can manage and control mock data more flexibly, especially in complex testing scenarios.



### Cleaning up mocks

Every time the `close` method is called, all mock data is automatically cleared.

If you want to clean up manually, you can also execute the `restoreAllMocks` method.

```typescript
import { restoreAllMocks } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  restoreAllMocks();
  // ...
});
```

Starting from version `3.19.0`, it supports cleaning up by specifying a group.

```typescript
import { restoreMocks } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  restoreMocks('group1');
  // ...
});
```

### Standard Mock service

Midway provides standard MidwayMockService services for simulating data in code.

Various simulation methods in `@midwayjs/mock` have all called this service at the bottom.

For more information, see [Built-in services](./built_in_service#midwaymockservice).



## Development Mock

Whenever the back-end service is not online, or when the data is not prepared during the development phase, the ability to simulate during the development phase is required.



### Write mock class

Under normal circumstances, we will write the simulation data used during development in the `src/mock` folder, and our simulation behavior is actually a piece of logic code.

:::tip

Don't get used to mocking data in code, it's actually part of the logic.

:::

Let's take an example. If there is a service for obtaining Index data, but the service has not been developed yet, we can only write simulation code.

```typescript
// src/service/indexData.service.ts
import { Singleton, makeHttpRequest, Singleton } from '@midwayjs/core';

@Singleton()
export class IndexDataService {
  
   @Config('index')
   indexConfig: {indexUrl: string};

   private indexData;

   async load() {
     // get data from remote
     this.indexData = await this.fetchIndex(this.indexConfig.indexUrl);
   }
  
   public getData() {
     if (!this. indexData) {
       // If the data does not exist, load it once
       this. load();
     }
     return this. indexData;
   }

   async fetchIndex(url) {
     return makeHttpRequest<Record<string, any>>(url, {
       method: 'GET',
       dataType: 'json',
     });
   }
}
```

:::tip

In the above code, the `fetchIndex` method is intentionally removed to facilitate subsequent simulation behaviors.

:::

When the interface has not been developed, it is very difficult for us to develop locally. The common practice is to define a JSON data,

For example, create a `src/mock/indexData.mock.ts` to mock the initial service interface.

```typescript
// src/mock/indexData.mock.ts
import { Mock, ISimulation } from '@midwayjs/core';

@Mock()
export class IndexDataMock implements ISimulation {
}
```

`@Mock` is used to represent that it is a simulation class, which is used to simulate some business behaviors, and `ISimulation` is some interfaces that need to be implemented by the business.

For example, we want to simulate the data of the interface.

```typescript
// src/mock/indexData.mock.ts
import { App, IMidwayApplication, Inject, Mock, ISimulation, MidwayMockService } from '@midwayjs/core';
import { IndexDataService } from '../service/indexData.service';

@Mock()
export class IndexDataMock implements ISimulation {

   @App()
   app: IMidwayApplication;

   @Inject()
   mockService: MidwayMockService;

   async setup(): Promise<void> {
     // Mock properties using the MidwayMockService API
     this.mockService.mockClassProperty(IndexDataService, 'fetchIndex', async (url) => {
       // return different data according to the logic
       if (/current/.test(url)) {
         return {
           data: require('./resource/current.json'),
         };
       } else if (/v7/.test(url)) {
         return {
           data: require('./resource/v7.json'),
         };
       } else if (/v6/.test(url)) {
         return {
           data: require('./resource/v6.json'),
         };
       }
     });
   }

   enableCondition(): boolean | Promise<boolean> {
     // Conditions for the mock class to be enabled
     return ['local', 'test', 'unittest']. includes(this. app. getEnv());
   }
}
```

In the above code, `enableCondition` is a method that must be implemented, which represents the enabling condition of the current simulation class. For example, the above code only takes effect in `local`, `test` and `unittest` environments.



### Simulation Timing

The simulation class contains some simulation opportunities, which have been defined in the `ISimulation` interface, such as:

```typescript
export interface ISimulation {
   /**
    * The initial simulation timing is executed after the life cycle onConfigLoad
    */
   setup?(): Promise<void>;
   /**
    * Executed when the life cycle is closed, generally used for data cleaning
    */
   tearDown?(): Promise<void>;
   /**
    * Executed when each framework is initialized, the app of the current framework will be passed
    */
   appSetup?(app: IMidwayApplication): Promise<void>;
   /**
    * Executed at the beginning of each frame's request, the app and ctx of the current frame will be passed
    */
   contextSetup?(ctx: IMidwayContext, app: IMidwayApplication): Promise<void>;
   /**
    * Executed at the end of each frame request, after error handling
    */
   contextTearDown?(ctx: IMidwayContext, app: IMidwayApplication): Promise<void>;
   /**
    * Executed when each frame is stopped
    */
   appTearDown?(app: IMidwayApplication): Promise<void>;
   /**
    * The execution conditions of the simulation are generally a specific environment or a specific framework
    */
   enableCondition(): boolean | Promise<boolean>;
}
```

Based on the above interface, we implement very free simulation logic.

For example, add different middleware on different frameworks.

```typescript
import { App, IMidwayApplication, Mock, ISimulation } from '@midwayjs/core';

@Mock()
export class InitDataMock implements ISimulation {

   @App()
   app: IMidwayApplication;

   async appSetup(app: IMidwayApplication): Promise<void> {
     // Add different test middleware for different framework types
     if (app. getNamespace() === 'koa') {
       app. useMiddleware(/*...*/);
       app. useFilter(/*...*/);
     }
    
     if (app. getNamespace() === 'bull') {
       app. useMiddleware(/*...*/);
       app. useFilter(/*...*/);
     }
   }

   enableCondition(): boolean | Promise<boolean> {
     return ['local', 'test', 'unittest']. includes(this. app. getEnv());
   }
}
```
