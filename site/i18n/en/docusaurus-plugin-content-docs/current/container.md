# Dependency injection

Midway uses a lot of dependency injection features. Through the lightweight features of decorators, dependency injection becomes elegant, thus making the development process convenient and interesting.


Dependency injection is a very important core in the Java Spring system, and we explain this capability in a simple way.


As an example, take the following function directory structure as an example.


```
.
├── package.json
├── src
│   ├── controller											# Controller directory
│   │   └── user.controller.ts
│   └── service			  									# Service Directory
│       └── user.service.ts
└── tsconfig.json
```


In the above example, two files, `user.controller.ts` and `user.service.ts`, are provided.

:::tip
In the following example, in order to show the complete function, we will write a complete `@Provide` decorator, but in actual use, if there are other decorators (such as `@Controller`), `@Provide` can be used Omit.
:::


For the convenience of explanation, we merged it together, and the content is roughly as follows.


```typescript
import { Provide, Inject, Get } from '@midwayjs/core';

// user.controller.ts
@Provide() // Actually can be omitted
@Controller()
export class UserController {

  @Inject()
  userService: UserService;

  @Get('/')
  async get() {
    const user = await this.userService.getUser();
    console.log(user);      // world
  }
}

// user.service.ts
@Provide()
export class UserService {
  async getUser() {
    return 'world';
  }
}

```

Leaving aside all the decorators, you can see that this is the standard Class writing and there is no other extra content. This is also the core capability of Midway system and the most fascinating place to rely on injection.

What `@Provide` does is tell the **dependency injection container** that I need to be loaded by the container. The `@Inject` decorator tells the container that I need to inject an instance into the property.

Through the matching of these two decorators, we can easily get the instance object in any class, just like `this.userService` above.

**Note**: In actual use, if there are other decorators (such as `@Controller` ), the `@Provide` is often omitted.



## Dependency injection principle


Let's take the following pseudo code as an example. During the startup phase of Midway system, a dependency injection container (MidwayContainer) will be created, files in all user codes (src) will be scanned, and Class with `@Provide` decorator will be saved to the container.


```typescript
/***** The following is Midway's internal code *****/

const container = new MidwayContainer();
container.bind(UserController);
container.bind(UserService);

```

The dependency injection container here is similar to a Map. The key of the map is the identifier of the class (for example, **the hump string of the class name** ), and the value is the **class itself**.

![image.png](https://img.alicdn.com/imgextra/i3/O1CN01qRbFaS1dETlDbbrsl_!!6000000003704-2-tps-623-269.png)


When requested, these Classes are dynamically instantiated and the assignment of attributes is handled, such as the pseudo code below, which is easy to understand.


```typescript
/***** The following is the dependency injection container pseudo code *****/
const userService = new UserService();
const userController = new UserController();

userController.userService = userService;
```


After this, we can get the complete `userController` object, and the actual code will be slightly different.


MidwayContainer have `getAsync` methods for asynchronously processing the initialization of objects (many dependencies are required for asynchronous initialization), automatic attribute assignment, caching, returning objects, and combining the above processes into one.


```typescript
/***** The following is the internal code of the dependency injection container *****/

// Automatic new UserService();
// Automatic new UserController();
// Automatic assignment userController.userService = await container.getAsync(UserService);

const userController = await container.getAsync(UserController);
await userController.handler(); // output 'world'
```


The above is the core process of dependency injection, creating an instance.


:::info
In addition, here is an article called ["This time, I will teach you to write an IoC container from scratch"](https://mp.weixin.qq.com/s/g07BByYS6yD3QkLsA7zLYQ). Please read it more.
:::



## Dependency injection scope


If the default is unspecified or undeclared, the scope of all `@Provide` classes is the **request scope**. This means that these Classes will be instantiated (new) at the first call of each request, and the instance will be destroyed after the request ends. **Our controller (Controller) and service (Service) by default are both in this scope.

In Midway's dependency injection system, there are three scopes.

| Scope | Description |
| --------- | ------------------------------------------------------------ |
| Singleton | Single instance, globally unique (process level) |
| Request | **Default**: the scope of the request, the lifecycle of the request is bound to the **request link**. The instance is unique on the request link and destroyed immediately after the request ends. |
| Prototype | Prototype scope, creating a new object repeatedly for each call |

Different scopes have different functions, * * Singleton * can be used to do process-level data cache, or database connection and other tasks that only need to be performed once. at the same time, Singleton is only initialized once due to global uniqueness, so the calling speed is relatively fast. However, **request scope** is the choice of most services that need to obtain request parameters and data. **prototype scope** is less used and has its unique function in some special scenarios.



### Configure scope


If we need to define one object as the other two scopes, additional configuration is required. Midway provides a `@Scope` decorator to define the scope of a class. The following code turns our user service into a globally unique instance.


```typescript
// service
import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {
  //...
}
```

:::info

Note that all entry classes, such as Controller, are request scopes and do not support modification. In most cases, only the Service needs to be adjusted.

:::



### Singleton scope

After explicit configuration, the scope of a class can become a singleton scope. .

```typescript
// service
import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {
  //...
}

```

No matter how many times an instance of this class is obtained in the future, it will be the same instance under the same process.

For example, based on the above singleton service, the following two injected `userService` attributes are the same instance:

```typescript
@Provide()
export class A {

  @Inject()
  userService: UserService
  //...
}

@Provide()
export class B {

  @Inject()
  userService: UserService
  //...
}
```

After the v3.10 version, the singleton decorator can be used to simplify the original writing.

```typescript
import { Singleton } from '@midwayjs/core';

@Singleton()
class UserService {
   //...
}
```

### Request scope

By default, all classes written in the code are **request scope**.

In each protocol entry framework, a dependency injection container under the request scope is automatically created, and all created instances are bound to the context of the current protocol.

For example:

- When an http request comes in, a request scope is created, and each Controller is dynamically created when the request is routed.
- The timer is triggered, which is equivalent to creating a request scope ctx. We can get this request scope through @Inject()ctx.

:::info
The default is the request scope for the purpose of associating with the request context. Explicitly passing ctx is more secure and reliable, and easy to debug.
:::

Therefore, in the request scope, we can use `@Inject()` to inject the current ctx object.

```typescript
import { Controller, Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Provide() // actually can be omitted
@Controller('/user')
export class UserController {

  @Inject()
  ctx: Context;
  //...
}
```




Our `@Inject` decorator also looks for objects to inject under the **scope** of the current class. For example, in the `Singleton` scope, it is incorrect to inject CTX because it is not associated with the request and there is no `CTX` object by default.

```typescript
@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {

  @Inject()
  ctx; // undefined
  //...
}
```



### Scope cache


When the scope is set to a singleton (Singleton), the entire Class injected object has been fixed after the first instantiation, which means that the injected content in the singleton cannot be another scope.


Let's give an example.
```typescript
// This class is the default request scope (Request)
@Provide() // Actually can be omitted
@Controller()
export class HomeController {
  @Inject()
  userService: UserService;
}


// Set a single instance, the process level is unique.
@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {
	async getUser() {
  	// ...
  }
}
```
The situation of the call is as follows.
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01FN99rS1Xb1YydSFi0_!!6000000002941-2-tps-1110-388.png)

In this case, no matter how many times the `HomeController` is called, the `HomeController` instance of each request is different, and the `UserService` will be fixed.


Let's take another example to show whether the service injected in the singleton will still retain the original scope.

:::info
The `DBManager` here is specially set to the request scope to demonstrate the special scene.
:::
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01eAyxrC1xVEYzbNf9P_!!6000000006448-2-tps-1964-334.png)

```typescript
// This class is the default request scope (Request)
@Provide()
export class HomeController {
  @Inject()
  userService: UserService;
}


// Set a single instance, the process level is unique.
@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {

  @Inject()
  dbManager: DBManager;

  async getUser() {
  	// ...
  }
}

// The scope is not set, and the default is the request scope (here is used to verify the scenario where all subsequent instances are cached under the single instance link)
@Provide()
export class DBManager {
}

```
In this case, no matter how many times the `HomeController` is called, the `HomeController` instance of each request is different, and the `UserService` and `DBManager` will be fixed.

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01UoLu1526stZQFhp1U_!!6000000007718-2-tps-1870-762.png)
Simply understood, a singleton is like a cache in **which all dependent objects will be frozen and will not change.**



### Scope downgrade

As mentioned above, when a singleton scope is injected with a request scope object, the object instance of the request scope is solidified and a fixed instance is saved in the singleton cache.

In this case, the scope of the request becomes a single instance, and the **scope is degraded** occurs.

In daily development, this happens if you are not careful, such as calling services in middleware.

```typescript
// The following paragraph is an example of error

@Provide()
export class UserService {
  @Inject()
  ctx: Context;

  async getUser() {
    const id = this.ctx.xxxx;
    // ctx not found, will throw error
  }
}

// Middleware is a singleton
@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  userService: UserService; // The user service here is the request scope

  resolve() {
  	return async(ctx, next) => {
      await this.userService.getUser();
      // ...
    }
  }
}
```

At this time, although `UserService` can be injected into the middleware normally, it is actually injected as a singleton object instead of an object in the request scope, which will cause `ctx` to be empty.

The memory object diagram at this time is:

![](https://img.alicdn.com/imgextra/i3/O1CN01SwATKb1zUtVUCaQGj_!!6000000006718-2-tps-1292-574.png)

Instances of `UserService` become different objects, one is an instance of singleton invocation (singleton, excluding ctx), and the other is an instance of normal request-scoped invocation (request-scoped, including ctx).

In order to avoid this situation, by default, when injecting such errors, the framework will automatically throw an error named `MidwaySingletonInjectRequestError` to prevent the program from executing.

If the user understands the risks involved and explicitly needs to call the request scope object in a singleton, the parameter of the scope decorator can be set to allow degradation.

In the `ctx` field, determine the empty object.

```typescript
import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class UserService {
  @Inject()
  ctx: Context;

  async getUser() {
    if (ctx && ctx.xxxx) {
      // ...
    }
		// ...
  }
}
```

Of course, if it is just a mistake, then you can use dynamic acquisition methods to make the scope uniform.

```typescript
import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const userService = await ctx.requestContext.getAsync(UserService);
        // TODO userService.xxxx
      await next();
    };
  }
}
```


## Injection rule

Midway supports injection in many ways.

### Class-based injection

Export a Class, the type of injection uses Class, which is the simplest way to inject, and most businesses and components use this way.

```typescript
import { Provide, Inject } from '@midwayjs/core';

@Provide() // <------ Expose a Class
export class B {
  //...
}

@Provide()
export class A {

  @Inject()
  B: B; // <------ The attribute here uses Class

  //...
}
```

Midway will automatically use B as the type of the attribute B and instantiate it in the container.

In this case, Midway automatically creates a unique uuid to associate with the class. This uuid is called a **dependency injection identifier**.


Default:


- 1. `@Provide` will automatically generate a uuid as the dependency injection identifier
- 2. `@Inject` searches for the uuid of the type.

If you want to get this uuid, you can use the following API.

```typescript
import { getProviderUUId } from '@midwayjs/core';

const uuid = getProviderUUId(B);
// ...
```



### Injection Based on fixed name

```typescript
import { Provide, Inject } from '@midwayjs/core';

@Provide ('BBB') // <------ Expose a Class
export class B {
  //...
}

@Provide()
export class A {

  @Inject('bbbb')
  B: B; // <------ The attribute here uses Class

  //...
}
```

Midway uses `bbbb` as the dependency injection identifier for Class B and instantiates it in the container. In this case, even if type B is written, the dependency injection container will still search for `bbbb`.

The parameters of `@Provide` and `@Inject` decorators appear in pairs.

The rules are as follows:


- 1. If the decorator contains parameters, the **parameter** is used as the dependency injection identifier.
- 2. If there are no parameters and the marked TS type is Class, the key of class `@Provide` is taken as the key. If there is no key, uuid is taken by default
- 3. If there is no parameter and the marked TS type is not Class, use the **attribute name** as the key.



### Injection Based on Attribute Name

Midway can also inject based on the interface, but since the Typescirpt will remove the interface type after compilation, it is better to use the class as a definition.

For example, we define an interface and its implementation class.

```typescript
export interface IPay {
  payMoney()
}

@Provide('APay')
export class A implements IPay {
  async payMoney() {
    // ...
  }
}

@Provide('BPay')
export class B implements IPay {
  async payMoney() {
    // ...
  }
}
```

At this time, if there is a service that needs to be injected, you can use the following explicit declaration.

```typescript
@Provide()
export class PaymentService {

  @Inject('APay')
  payService: IPay; // Note that the type here is an interface, and the type information will be removed after compilation.

  async orderGood() {
    await this.payService.payMoney();
  }

}
```

Because the interface type is removed, Midway can only use the **parameter** or **attribute name** class of the `@Inject` decorator to match the injected object information, similar to the `Autowire by name` in Java Spring.

### Inject existing objects


Sometimes, applications already have existing instances instead of classes. For example, a third library is introduced. At this time, if you want objects to be referenced by instances in other IoC containers, you can also add objects to handle them.


Let's take the common tool class library lodash as an example.

If we want to inject it directly in different classes, instead of require.

You need to add this object through the `registerObject` method before the business call (usually during the startup life cycle).


A **dependency injection identifier** is required to facilitate injection in other classes.


```typescript
// src/configuration.ts
import * as lodash from 'lodash';
import { Configuration, IMidwayContainer } from '@midwayjs/core';

@Configuration()
export class MainConfiguration {

  async onReady(applicationContext: IMidwayContainer) {
		// Add some global objects to the dependency injection container
  	applicationContext.registerObject('lodash', lodash);
  }
}

```


At this time, you can use `@Inject` in any class.


```typescript
@Provide()
export class BaseService {

  @Inject('lodash')
  lodashTool;

  async getUser() {
    // this.lodashTool.defaults({ 'a': 1 }, { 'a': 3, 'B ': 2 });
  }
}
```



### Inject default identifier


Midway injects some values by default to facilitate direct business use.

| **Identifier** | **Value Type** | **Scope** | **Description** |
| ---------- | ---------- | ---------- | ------------------------------------------------------------ |
| baseDir | string | Global | The src directory is developed locally, otherwise it is dist directory. |
| appDir | string | Global | The root path of the application is generally process.cwd() |
| ctx | object | Request | The context type of the corresponding framework, such as the Context of Koa and EggJS, and the req of the Express. |
| logger | object | Request | Equivalent to ctx.logger |
| req | object | Request | Unique to Express |
| res | object | Request | Unique to Express |
| socket | object | Request | WebSocket scenes are unique |

```typescript
@Provide()
export class BaseService {

  @Inject()
  baseDir;

  @Inject()
  appDir;

  async getUser() {
    console.log(this.baseDir);
    console.log(this.appDir);
  }
}
```



## Get the dependency injection container


In general, users do not need to care about relying on injection containers, but in some special scenarios, such


- The service needs to be called dynamically, such as the middleware scenario of the Web, and the service needs to be called during the startup phase.
- The encapsulation framework or other tripartite SDKs require dynamic access to services.

Simply put, in any scenario where you need to **dynamically obtain services through API operations**, you must first obtain the dependency injection container.

### Get from @ApplicationContext() decorator

In the new version, Midway provides a @ApplicationContext() decorator to get the dependency injection container.

```typescript
import { ApplicationContext, IMidwayContainer } from '@midwayjs/core';

@Provide()
export class BootApp {

  @ApplicationContext()
  applicationContext: IMidwayContainer; // You can also replace it with the app definition of the actual framework here.

  async invoke() {

    // this.applicationContext

  }

}
```



### Get from app


Midway mounts the dependent injection container in two places, the app of the framework and the context Context of each request. Due to the different situations of different upper-level frameworks, let's list common examples here.


For different upper-level frameworks, we provide a unified definition of `IMidwayApplication`. All upper-level framework apps will implement this interface, which is defined as follows.

```typescript
export interface IMidwayApplication {
  getApplicationContext(): IMidwayContainer;
  //...
}
```

That is, through the `app.getApplicationContext()` method, we can all obtain the dependency injection container.

```typescript
const container = app.getApplicationContext();
```

With the `@App` decorator, you can easily access the currently running app instance anywhere.

```typescript
import { App, IMidwayApplication } from '@midwayjs/core';

@Provide()
export class BootApp {

  @App()
  app: IMidwayApplication; //You can also replace it with the app definition of the actual framework here.

  async invoke() {

    // Get the dependency injection container
  	const applicationContext = this.app.getApplicationContext();

  }

}
```


In addition to the common dependency injection container, Midway also provides a **dependency injection container for the request link.** The dependency injection container for this request link is associated with a global dependency injection container and shares an object pool. But there is still a difference between the two.


The dependency injection container of the request link is used to obtain the objects of the specific request scope. The objects obtained in this container are **bound to the request** and are associated with the current context. This means that **if the Class code is associated with the request, it must be obtained from the dependency injection container of the request link**.


The dependency injection container of the request link must be obtained from the request context object. The most common scenario is web middleware.


```typescript
@Middleware()
export class ReportMiddleware {

  resolve() {
  	return async(ctx, next) => {
      // ctx. Dependency Injection Container for requestContext Request Link
      await next();
    }
  }
}
```
The Express request link depends on the injection container mounted on the req object.

```typescript
@Middleware()
export class ReportMiddleware {

  resolve() {
  	return (req, res, next) => {
      // req. Dependency Injection Container for requestContext Request Link
      next();
    }
  }
}
```



### Get in Configuration

In the life cycle of the code entry `configuration` file, we will also pass additional parameters that depend on the injection container, which is convenient for users to use directly.

```typescript
// src/configuration.ts
import { Configuration, IMidwayContainer } from '@midwayjs/core';

@Configuration()
export class MainConfiguration {
  async onReady(applicationContext: IMidwayContainer) {
    // ...
  }
}
```



## Dynamic API



### Dynamic acquisition of instances

After you get the **dependency injection container** or **dependency of the request link** injection container, you can obtain the object through the container API.

We can use the standard dependency injection container API to obtain instances.

```typescript
// The global container is obtained as a singleton.
const userSerivce = await applicationContext.getAsync(UserService);

// Request scope container, get the request scope instance.
const userSerivce = await ctx.requestContext.getAsync(UserService);
```

We can use it wherever we can get dependent injection containers, such as in middleware.

```typescript
import { Middleware, ApplicationContext, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { UserService } from './service/user.service';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  @ApplicationContext()
  applicationContext: IMidwayContainer;

  resolve() {
  	return async(ctx, next) => {
      // Specify a generic type, such as an interface
      const userService1 = await this.applicationContext.getAsync<UserService>(UserService);
      // You can deduce the correct type without writing generics.
      const userService1 = await this.applicationContext.getAsync(UserService);

      // The following method obtains the service and request association, which can be injected into the context.
      const userService2 = await ctx.requestContext.getAsync<UserService>(UserService);
      await next();
    }
  }
}
```


In Express.
```typescript
import { UserService, Middleware } from './service/user';
import { NextFunction, Context, Response } from '@midwayjs/express';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, Response, NextFunction> {

  resolve() {
  	return async (req, res, next) => {
      const userService = await req.requestContext.getAsync<UserService>(UserService);
      // ...
      next();
    }
  }
}
```



### Pass constructor parameters

In individual scenarios, we can pass the constructor parameters when we get the instance through the `getAsync`. Normal decorator mode cannot be done, only available in API form.

```typescript
@Provide()
class UserService {
  constructor(private readonly type) {}

  getUser() {
    // this.type => student
  }
}

// The global container is obtained as a singleton.
const userSerivce = await applicationContext.getAsync(UserService, [
  'student', // constructor parameters, will apply to the constructor
]);

// Request scope container, get the request scope instance.
const userSerivce = await ctx.requestContext.getAsync(UserService, [
  'student'
]);
```

Note that the constructor cannot pass instances in injection form, but can only pass fixed values.




### Dynamic function injection


In some scenarios, we need functions to be executed dynamically as a logic, while the object properties in the dependent injection container are already created and cannot meet the dynamic logic requirements.


For example, you need a factory function to return different instances according to different scenarios, or you may have a three-party package, which is a function that you want to call directly in the business. In various scenarios, you need to inject a factory method directly, get the context in the function, and dynamically generate the instance.


The following is a sample of the standard factory method injection.


General factory methods are used to return the implementation of the same interface, for example, we have two `ICacheService` interface implementations:
```typescript
export interface ICacheService {
  getData(): any;
}

@Provide()
export class LocalCacheService implements ICacheService {
  async getData {}
}

@Provide()
export class RemoteCacheService implements ICacheService {
  async getData {}
}
```
Then you can define a dynamic service (factory) and return different implementations according to the current user configuration.
```typescript
// src/service/dynamicCacheService.ts

import { providerWrapper, IMidwayContainer, MidwayConfigService } from '@midwayjs/core';

export async function dynamicCacheServiceHandler(container: IMidwayContainer) {
	// Get global configuration from container API
  const config = container.get(MidwayConfigService).getConfiguration();
  if (config['redis']['mode'] === 'local') {
    return await container.getAsync('localCacheService');
  } else {
    return await container.getAsync('remoteCacheService');
  }
}

providerWrapper ([
  {
    id: 'dynamicCacheService',
    provider: dynamicCacheServiceHandler
    Scope: ScopeEnum.Request, // is set to the request scope, then the container passed in above is the request scope container.
    // scope: ScopeEnum.Singleton, // can also be set to global scope, then the logic of the call will be cached
  }
]);
```


In this way, it can be used directly in business. Note: When injecting, the method is **called and then injected**.


```typescript
@Provide()
@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Inject('dynamicCacheServiceHandler')
  cacheService: ICacheService;

  @Get('/')
  async home() {
    const data = await this.cacheService.getData();
    // ...
  }

}
```


By `providerWrapper`, we have wrapped an original function writing method, which can be integrated with the existing dependency injection system, so that the container can be managed uniformly.


:::info
Note that dynamic methods must be exported before they are scanned by dependency injection. The default is the request scope (the Container obtained is the request scope container).
:::


Since we can bind the dynamic method to the dependency injection container, we can also bind a callback method in, so that the obtained method can be executed, and we can determine the returned result based on the parameters of the business.
```typescript
import { providerWrapper, IMidwayContainer } from '@midwayjs/core';

export function cacheServiceHandler(container: IMidwayContainer) {
  return async (mode: string) => {
    if (mode === 'local') {
      return await container.getAsync('localCacheService');
    } else {
      return await container.getAsync('remoteCacheService');
    }
  };
}

providerWrapper ([
  {
    id: 'cacheServiceHandler',
    provider: cacheServiceHandler
    scope: ScopeEnum.Singleton
  }
]);


@Provide()
@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Inject('cacheServiceHandler')
  getCacheService;

  @Get('/')
  async home() {
    const data = await this.getCacheService('local');
    // ...
  }

}
```



## Static API


In some tool classes, you can obtain the global dependency injection container (**after startup**) without creating a class instance.
```typescript
import { getCurrentApplicationContext } from '@midwayjs/core';

export const getService = async (serviceName) => {
  return getCurrentApplicationContext().getAsync(serviceName);
}
```


Gets the main frame **after startup**.
```typescript
import { getCurrentMainFramework } from '@midwayjs/core';

export const framework = () => {
  return getCurrentMainFramework();
}
```
Gets the app object of the main frame **after startup**.
```typescript
import { getCurrentMainApp } from '@midwayjs/core';

export const getGlobalConfig = () => {
  return getCurrentMainApp().getConfig();
}
```



## Start Behavior

### Automatic scan binding

As mentioned above, after the container is initialized, we will bind the existing class registration to the container.

```typescript
const container = new MidwayContainer();
container.bind(UserController);
container.bind(UserService);
```

Midway will automatically scan the entire project directory during the startup process and automatically process this behavior, so that the user does not need to manually perform binding operations.

Simply put, the framework will recursively scan the ts/js files in the entire `src` directory by default, and then perform require operations. When the file is exported as a class and explicitly or implicitly contains the `@Provide()` decorator, it will execute the `container.bind` logic.

### Ignore scanning

In general, we should not put non-ts files under src (such as front-end code). In special scenarios, we can ignore some directories and configure them in the `@Configuration` decorator.

An example is as follows:

```typescript
// src/configuration.ts
import { App, Configuration, Logger } from '@midwayjs/core';
// ...

@Configuration({
  // ...
  detectorOptions: {
    ignore: [
      '**/web/**'
    ]
  }
})
export class MainConfiguration {
  // ...
}

```





## Object lifecycle

When creating and destroying instances depending on the injection container, we can use the decorator to do some custom operations.



### Asynchronous initialization


In some cases, we need an instance to be initialized before being called by other dependencies. If this initialization only reads a certain file, it can be written as a synchronization method. If this initialization is to take data from a remote end or connect to a certain service, in this case, ordinary synchronization code is very difficult to write.


Midway provides asynchronous initialization. You can use the `@Init` tag to manage initialization methods.

Only one `@Init` method can be used.


```typescript
@Provide()
export class BaseService {

  @Config('hello')
  config;

  @Init()
  async init() {
    await new Promise(resolve => {
      setTimeout(() => {
        this.config.c = 10;
        resolve();
      }, 100);
    });
  }

}
```


Equivalent

```typescript
const service = new BaseService();
await service.init();
```

:::info
The method marked by the @Init decorator will definitely be called asynchronously. In general, asynchronous initialization of services is slow, please label it as a singleton (@Scope(ScopeEnum.Singleton)) as much as possible.
:::



### Asynchronous destruction

Midway provides the ability to execute methods before objects are destroyed and manages methods through the `@Destroy` decorator.

There is currently only one `@Destroy` method.


```typescript
@Provide()
export class BaseService {

  @Config('hello')
  config;

  @Destroy()
  async stop() {
    // do something
  }
}
```



## Context object in request scope

For objects created in the request scope, the framework will mount a context object on the object, even if the object does not explicitly declare `@Inject() ctx`, the current context object can be obtained.

```typescript
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';

@Provide()
export class UserManager {
   //...
}

@Provide()
export class UserService {
   //...

   @Inject()
   userManager: UserManager;

   async invoke() {
     const ctx = this. userManager[REQUEST_OBJ_CTX_KEY];
     //...
   }
}
```

This feature is useful in [Interceptor](./aspect) or [Custom Method Decorator](./custom_decorator).



## Common usage errors


### Error: Get Injection Property in Constructor

Please do not get the injected attribute in the constructor * *, which will make the result undefined. The reason is that the properties injected by the decorator are assigned only after the instance is created (new). In this case, use the `@Init` decorator.

```typescript
@Provide()
export class UserService {

  @Config('userManager')
  userManager;

  constructor() {
    console.log(this.userManager); // undefined
  }

  @Init()
  async initMethod() {
    console.log(this.userManager); // has value
  }

}
```



### On inheritance


To avoid property confusion, do not use the `@Provide` decorator on the base class.


At this stage, Midway supports the inheritance of attribute decorators, but does not support the inheritance of class and method decorators (there will be ambiguity).
