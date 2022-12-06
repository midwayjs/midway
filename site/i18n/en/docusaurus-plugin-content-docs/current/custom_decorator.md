# Custom decorator

In the new version, Midway provides custom decorator capabilities supported by the framework, which includes several common functions:

- Define inheritable attribute decorators
- Define a wrappable method as a method decorator for interception
- Define parameter decorators that modify parameters

We take into account the current stage of decorators in the standard and subsequent risks. Midway provides a custom decorator method and its supporting capabilities to be implemented by the framework to avoid the problems caused by subsequent specification changes as much as possible.

In general, we recommend placing custom decorators in the `src/decorator` directory.

For example:

```
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   ├── user.controller.ts
│   │   └── home.controller.ts
│   ├── interface.ts
│   ├── decorator                   ## custom decorator
│   │   └── user.decorator.ts
│   └── service
│       └── user.service.ts
├── test
├── package.json
└── tsconfig.json
```

## Decorator API

Midway has a set of standard decorator management API, which is used to inject decorator docking dependencies into containers for scanning and expansion. We export these API methods from the `@midwayjs/decorator` package.

Through the decorator advanced API, we can customize the decorator and attach metadata to it. The various decorators inside are realized through this capability.

Common extension APIs are:

**Decorator**

- `saveModule` is used to save a class to a decorator
- `listModule` get all classes bound to a type of decorator

**Meta-information access (corresponding to** [**reflect-metadata**](https://www.npmjs.com/package/reflect-metadata)**)**

- Save meta information to class `saveClassMetadata`
- `attachClassMetadata` additional meta information to class
- `getClassMetadata` get meta information from class
- `savePropertyDataToClass` saves the property's meta information to the class`
- `attachPropertyDataToClass` meta-information for additional attributes to class
- `getPropertyDataFromClass` get attribute meta information from class
- `listPropertyDataFromClass` listing meta-information for all attributes saved on class
- `savePropertyMetadata` save attribute meta-information to the attribute itself
- `attachPropertyMetadata` additional attribute meta-information to the attribute itself
- `getPropertyMetadata` get the saved meta information from the attribute

**shortcut**

- `getProviderUUId` get the uuid provide by class, which corresponds to a class and will not change.
- The name saved when the `getProviderName` gets the provide, usually the class name is lowercase.

- `getProviderId` get the id provide on the class, which is usually a lowercase class name or a custom id.
- `isProvide` judge whether a class has been modified by @Provide
- `getObjectDefinition` Get Object Definition (ObjectDefiniton)
- `getParamNames` get all parameter names of a function
- `getMethodParamTypes` gets the parameter type of a method, which is equivalent to `Reflect.getMetadata(design:paramtypes)`
- `getPropertyType` get the type of an attribute, which is equivalent to `Reflect.getMetadata(design:type)`
- `getMethodReturnTypes` get method return value type, equivalent to `Reflect.getMetadata(design:returntype)`

## Class decorator

Generally, class decorators are used in conjunction with other decorators to mark that a class belongs to a specific scene. For example, `@Controller` indicates that the class belongs to the entrance of the Http scene.

Let's take an example, define a class decorator @Model, identify class as a model class, and then further operate.

First create a decorator file, such as `src/decorator/model.decorator.ts`.

```typescript
import { Scope, ScopeEnum, saveClassMetadata, saveModule, Provide } from '@midwayjs/decorator';

// Provide a unique key
const MODEL_KEY = 'decorator:model';

export function Model(): ClassDecorator {
  return (target: any) => {
    // Bind the decorated class to the decorator to obtain the class later.
    saveModule(MODEL_KEY, target);
    // Save some metadata information, whatever you want to save.
    saveClassMetadata (
      MODEL_KEY,
      {
        test: 'abc',
      },
      target
    );
    // Specify the scope of the IoC container to create the instance, which is registered here as the request scope, so that ctx can be retrieved.
    Scope(ScopeEnum.Request)(target);

    // Call the Provide decorator so that the user's class can omit the @Provide() decorator.
    Provide()(target);
  };
}
```

The above only decided on this decorator, and we also need to implement the corresponding functions. midway v2 began to have the concept of life cycle, which can be executed in the life cycle of the `configuration`.

```typescript
// src/configuration.ts

import { listModule, Configuration, App, Inject } from '@midwayjs/decorator';
import { join } from 'path';
import * as koa from '@midwayjs/koa';
import { MODEL_KEY } from './decorator/model.decorator';

@Configuration({
  imports: [koa]
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // ...

    // All classes decorated with @Model() decorators can be obtained
    const modules = listModule(MODEL_KEY);
    for (let mod of modules) {
      // Realize custom capability
      // For example, take metadata getClassMetadata(mod)
      // For example, initialize app.applicationContext.getAsync(mod) in advance;
    }
  }
}
```

Finally, we're going to use this decorator.

```typescript
import { Model } from '../decorator/model.decorator';

// The role of Model is that our own logic can be executed (saved metadata)
@Model()
export class UserModel {
  // ...
}
```

## Property decorator

Midway provides `createCustomPropertyDecorator` methods for creating custom attribute decorators. decorators such as `@Logger` and `@Config` of the framework are all created in this way.

Unlike the decorator defined in the TypeScript, the attribute decorator provided by Midway can be used in inheritance.

Let's take an example. If there is a memory cache now, our property decorator is used to obtain cache data. Here are some preparations.

```typescript
// Simple cache class
import { Configuration, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MemoryStore extends Map {
  save(key, value) {
    this.set(key, value);
  }

  get(key) {
    return this.get(key);
  }
}

// src/configuration.ts
// The entry is instantiated and some data is saved.
import { Configuration, App, Inject } from '@midwayjs/decorator';
import { join } from 'path';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa]
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  @Inject()
  store: MemoryStore;

  async onReady() {
    // ...

    // Initialize some data
    store.save('aaa', 1);
    store.save('bbb', 1);
  }
}
```

Let's implement a simple `@MemoryCache()` decorator. The implementation of the property decorator is divided into two parts:

- 1. define a decorator method, generally only save metadata
- 2. Define an implementation before the decorator logic is executed

The following is the section that defines the decorator method.

```typescript
// src/decorator/memoryCache.decorator.ts
import { createCustomPropertyDecorator } from '@midwayjs/decorator';

// Unique id inside the decorator
export const MEMORY_CACHE_KEY = 'decorator:memory_cache_key';

export function MemoryCache(key?: string): PropertyDecorator {
  return createCustomPropertyDecorator(MEMORY_CACHE_KEY, {
    key
  });
}
```

It is implemented before the decorator's method is executed (usually at the initialization place). To realize the decorator, we need to use the built-in `MidwayDecoratorService` service.

```typescript
import { Configuration, Inject, Init } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { MEMORY_CACHE_KEY, MemoryStore } from 'decorator/memoryCache.decorator';
import { MidwayDecoratorService } from '@midwayjs/core';

@Configuration({
  imports: [koa]
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  @Inject()
  store: MemoryStore;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  async init() {
    // ...

    // Realize decorator
    this.decoratorService.registerPropertyHandler(MEMORY_CACHE_KEY, (propertyName, meta) => {
      return this.store.get(meta.key);
    });
  }
}
```

The `registerPropertyHandler` method contains two parameters, the first is the unique id defined by the previous decorator, and the second is the callback method implemented by the decorator.

`propertyName` is the method name of the decorator decoration, and meta is the parameter when the decorator is used.

Then we can use this decorator.

```typescript
import { MemoryCache } from 'decorator/memoryCache.decorator';

// ...
export class UserService {
  @MemoryCache('aaa')
  cacheValue;

  async invoke() {
    console.log(this.cacheValue);
    // => 1
  }
}
```

## Method decorator

Midway provides `createCustomMethodDecorator` methods for creating custom method decorators.

Different from the decorator defined in the TypeScript, the method decorator provided by Midway is uniformly implemented by interceptors, does not conflict with other interception methods, and is simpler.

Let's take the printing method execution time as an example.

Like property decorators, our definition and implementation are separate.

The following is the section that defines the decorator method.

```typescript
// src/decorator/logging.decorator.ts
import { createCustomMethodDecorator } from '@midwayjs/decorator';

// Unique id inside the decorator
export const LOGGING_KEY = 'decorator:logging_key';

export function LoggingTime(formatUnit = 'ms'): MethodDecorator {
	// We pass a parameter that modifies the display format
  return createCustomMethodDecorator(LOGGING_KEY, { formatUnit });
}
```

The implementation part also needs to use the framework's built-in `DecoratorService` service.

```typescript
//...

function formatDuring(value, formatUnit: string) {
  // Return time formatting here
  if (formatUnit === 'ms') {
    return `${value} ms`;
  } else if (formatUnit === 'min') {
    // return xxx
  }
}

@Configuration({
  imports: [koa]
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Logger()
  logger;

  async onReady() {
    // ...

    // Implementation method decorator
    this.decoratorService.registerMethodHandler(LOGGING_KEY, (options) => {
      return {
        around: async (joinPoint: JoinPoint) => {
          // Get the formatting parameters
          const format = options.metadata.formatUnit || 'ms';

          // Record start time
          const startTime = Date.now();

          // Execute the original method
          const result = await joinPoint.proceed(...joinPoint.args);

          const during = formatDuring(Date.now() - startTime, format);

          // Print execution time
          this.logger.info('Method ${joinPoint.methodName} invoke during ${during}');

          // Return execution result
          return result;
        },
      };
    });
  }
}
```

The first parameter of the `registerMethodHandler` method is the id defined by the decorator, and the second parameter is the implementation of the callback. The parameter is the options object, including:

| Parameters | Type | Description |
| -------------------- | ------------- | ---------------------- |
| options.target | new (...args) | The class in which the decorator is decorated. |
| options.propertyName | string | The name of the method where the decorator is decorated. |
| options.metadata | {} | Parameters of the decorator itself |

To implement a callback, you must return a method that is processed by the interceptor. The key is the `before`, `around`, `afterReturn`, `afterThrow`, and `after` of the interceptor.

Since the method decorator itself is implemented by the interceptor, you can view the [interceptor](aspect) section for specific interception methods.

Use the decorator as follows:

```typescript
// ...
export class UserService {
  @LoggingTime()
  async getUser() {
    // ...
  }
}

// When executing
// output => Method "getUser" invoke during 4ms
```

## Method decorator without implementation

By default, the custom method decorator must have an implementation, otherwise the runtime will report an error.

In some special cases, it is desirable to have a decorator that does not need to be implemented, such as only storing metadata without blocking.

You can add an impl parameter when defining the decorator.

```typescript
// src/decorator/logging.decorator.ts
import { createCustomMethodDecorator } from '@midwayjs/decorator';

// Unique id inside the decorator
export const LOGGING_KEY = 'decorator:logging_key';

export function LoggingTime(): MethodDecorator {
  // The last parameter tells the framework, no need to specify the implementation
  return createCustomMethodDecorator(LOGGING_KEY, {}, false);
}
```

## Parameter decorator

Midway provides `createCustomParamDecorator` methods for creating custom parameter decorators.

Parameter decorators are generally used to modify parameter values and preprocess data in advance. The decorators of request series such as `@Query` of Midway are implemented based on them.

Like other decorators, our definition and implementation are separate. Let's take the user (ctx.user) in the parameter as an example.

The following is the section that defines the decorator method.

```typescript
// src/decorator/logging.decorator.ts
import { createCustomParamDecorator } from '@midwayjs/decorator';

// Unique id inside the decorator
export const USER_KEY = 'decorator:user_key';

export function User(): ParameterDecorator {
  return createCustomParamDecorator(USER_KEY, {});
}
```

The implementation part also needs to use the `DecoratorService` service built into the framework.

```typescript
//...

@Configuration({
  imports: [koa]
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Logger()
  logger;

  async onReady() {
    // ...

    // Implement parameter decorator
    this.decoratorService.registerParameterHandler(USER_KEY, (options) => {
      // originArgs is the original method
      // The first parameter here is ctx, so ctx.user is taken.
      return options.originArgs[0]?.user ?? {};
    });
  }
}
```

The first parameter of the `registerParameterHandler` method is the id defined by the decorator, and the second parameter is the implementation of the callback. The parameter is the options object, including:

| Options | Type | Description |
| ----------------------- | --------------- | ---------------------- |
| options.target | new (...args) | The class in which the decorator is decorated. |
| options.propertyName | string | The name of the method where the decorator is decorated. |
| options.metadata | {} \| undefined | Parameters of the decorator itself |
| options.originArgs | Array | The original parameters of the method |
| options.originParamType |                 | The original parameter type of the method |
| options.parameterIndex | number | Parameter Index of Decorator Modification |

Use the decorator as follows:

```typescript
// ...
export class UserController {
  async invoke(@User() user: string) {
    console.log(user);
    // => xxx
  }
}
```

:::tip

Note that for the correctness of the method call, if an error is reported in the parameter decorator, the framework will use the original parameters to call the method and will not throw an exception directly.

You can find this error when turning on the `NODE_DEBUG = midway:debug` environment variable.

:::

## Method decorator gets context

On the request link, it is often difficult to get the context if the decorator is customized. If the code does not explicitly inject the context, it is very difficult to get it in the decorator.

In Midway's dependency injection request scope, we bind the context to each instance, and obtain the current context from the specific attribute of the instance `REQUEST_ OBJ_CTX_KEY`, thus further operating on the request.

For example, in our custom implementation of the method decorator:

```typescript
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';
//...

export class MainConfiguration {
  @App()
  app: koa.Application;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Logger()
  logger;

  async onReady() {
    // ...

    // Implementation method decorator
    this.decoratorService.registerMethodHandler(LOGGING_KEY, (options) => {
      return {
        around: async (joinPoint: JoinPoint) => {
          // Instance where the decorator is located
          const instance = joinPoint.target;
          const ctx = instance[REQUEST_OBJ_CTX_KEY];
          // ctx.xxxx
          // ...
        },
      };
    });
  }
}
```
