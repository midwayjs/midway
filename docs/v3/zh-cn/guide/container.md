# 依赖注入

Midway 中使用了非常多的依赖注入的特性，通过装饰器的轻量特性，让依赖注入变的优雅，从而让开发过程变的便捷有趣。



## 快速理解


依赖注入是 Java Spring 体系中非常重要的核心，我们用简单的做法讲解这个能力。


我们举个例子，以下面的函数目录结构为例。


```
.
├── package.json      
├── src
│   ├── controller											# 控制器目录
│   │   └── user.controller.ts
│   └── service			  									# 服务目录
│       └── user.service.ts
└── tsconfig.json
```


在上面的示例中，提供了两个文件， `userController.ts` 和 `userService.ts` 。为了解释方便，我们将它合并到了一起，内容大致如下。


```typescript
import { Provide, Inject, Get } from '@midwayjs/decorator';

// user.controller.ts
@Provide()
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
抛开所有装饰器，你可以看到这是标准的 Class 写法，没有其他多余的内容，这也是 Midway 体系的核心能力，依赖注入最迷人的地方。

`@Provide` 的作用是告诉 **依赖注入容器**，我需要被容器所加载。 `@Inject` 装饰器告诉容器，我需要将某个实例注入到属性上。

通过这两个装饰器的搭配，我们可以方便的在任意类中拿到实例对象，就像上面的 `this.userService` 。

**注意**：实际使用中，如果有其他装饰器（比如 `@Controller` ）的情况下 `@Provide` 经常被省略。




## 依赖注入原理


我们以下面的伪代码举例，在 Midway 体系启动阶段，会创建一个依赖注入容器（MidwayContainer），扫描所有用户代码（src）中的文件，将拥有 `@Provide` 装饰器的 Class，保存到容器中。


```typescript
/***** 下面为 Midway 内部代码 *****/

const container = new MidwayContainer();
container.bind(UserController);
container.bind(UserService);

```

这里的依赖注入容器类似于一个 Map。Map 的 key 是类对应的标识符（比如 **类名的驼峰形式字符串**），Value 则是 **类本身**。

![image.png](https://img.alicdn.com/imgextra/i3/O1CN01qRbFaS1dETlDbbrsl_!!6000000003704-2-tps-623-269.png)


在请求时，会动态实例化这些 Class，并且处理属性的赋值，比如下面的伪代码，很容易理解。


```typescript
/***** 下面为依赖注入容器伪代码 *****/
const userService = new UserService();
const userController = new UserController();

userController.userService = userService;
```


经过这样，我们就能拿到完整的 `userController`  对象了，实际的代码会稍微不一样。


MidwayContainer 有 `getAsync` 方法，用来异步处理对象的初始化（很多依赖都是有异步初始化的需求），自动属性赋值，缓存，返回对象，将上面的流程合为同一个。


```typescript
/***** 下面为依赖注入容器内部代码 *****/

// 自动 new UserService();
// 自动 new UserController();
// 自动赋值 userController.userService = await container.getAsync(UserService);

const userController = await container.getAsync(UserController);
await userController.handler();  // output 'world'
```


以上就是依赖注入的核心过程，创建实例。


:::info
此外，这里还有一篇名为 [《这一次，教你从零开始写一个 IoC 容器》](https://mp.weixin.qq.com/s/g07BByYS6yD3QkLsA7zLYQ)的文章，欢迎扩展阅读。
:::



## 依赖注入标识符

### 默认依赖注入标识符

在 Midway 的情况下，会将自动创建 uuid 关联这个 class，同时这个 uuid 我们称为 **依赖注入标识符**。


默认情况如下：


- 1、 `@Provide` 会自动生成一个 uuid 作为依赖注入标识符
- 2、 `@Inject` 根据类型的 uuid 来查找

```typescript
// service
@Provide()                          // <------ 这里 UserService 会自动生成一个 uuid
export class UserService 
  implements IService {
  //...
}

// controller
@Provide()
export class APIController {

  @Inject()            
  userService1: UserService;				// <------ 这里会查找 UserService 的 uuid
  
  //...
}
```

如果要获取这个 uuid，可以使用下面的 API。

```typescript
const uuid = getProvideUUId(UserService);
// ...
```



### 自定义依赖注入标识符

在默认情况下，Midway 会将类名变为 `驼峰` 形式作为依赖注入标识符，一般情况下，用户无需改变它。并且在使用时，直接在 Class 中使用 `@Provide` 和 `@Inject` 装饰器即可。

`@Provide` 和 `@Inject` 装饰器是有可选参数的，并且他们是成对出现。

规则如下：


- 1、如果装饰器包含参数，则以 **参数 **作为 key
- 2、如果没有参数，标注的 TS 类型为 Class，则将类 `@Provide` 的 key 作为 key，如果没有 key，默认取 uuid
- 3、如果没有参数，标注的 TS 类型为非 Class，则将 **属性名** 作为 key



两者相互一致即可关联。
```typescript
export interface IService {
}

// service
@Provide()                          // <------ 这里暴露的 key 是 uuid
export class UserService 
  implements IService {
  //...
}

// controller
@Provide()
@Controller('/api/user')
export class APIController {

  @Inject('userService')            // <------ 这里注入的 key 是 userService
  userService1: UserService;
    
  @Inject()
  userService2: UserService;        // <------ 这里的类型是 Class，注入的 key 是 UserService 对应的 uuid

    
  @Inject()
  userService: IService;            // <------ 这里的类型是 Interface，注入的 key 是 userService

  //...
}
```


我们可以修改暴露给依赖注入容器的 key，同时，注入的地方也要相应修改。
```typescript
// service
@Provide('bbbService')               // <------ 这里暴露的 标识符 是 bbbService
export class UserService {
  //...
}
               
// controller
@Provide()
export class UserController {

  @Inject('bbbService')              // <------ 这里注入的 标识符 是 bbbService
  userService: UserService;
	
  //...
}

```


## 作用域


默认的未指定或者未声明的情况下，所有的 `@Provide` 出来的 Class 的作用域都为 **请求作用域**。这意味着这些 Class ，会在**每一次请求第一次调用时被实例化（new），请求结束后实例销毁。**我们默认情况下的控制器（Controller）和服务（Service）都是这种作用域。


在 Midway 的依赖注入体系中，有三种作用域。


- Singleton 单例，全局唯一（进程级别）
- Request  **默认**，请求作用域，生命周期绑定**请求链路**，实例在请求链路上唯一，请求结束立即销毁
   - 例如http请求进来的时候，会创建一个请求作用域ctx，我们通过@Inject()ctx可以拿到这个请求作用域。
   - 例如定时器触发，也相当于创建了请求作用于ctx，我们可以通过@Inject()ctx可以拿到这个请求作用域。
- Prototype 原型作用域，每次调用都会重复创建一个新的对象



不同的作用域有不同的作用，**单例 **可以用来做进程级别的数据缓存，或者数据库连接等只需要执行一次的工作，同时单例由于全局唯一，只初始化一次，所以调用的时候速度比较快。而 **请求作用域 **则是大部分需要获取请求参数和数据的服务的选择，**原型作用域 **使用比较少，在一些特殊的场景下也有它独特的作用。


如果我们需要将一个对象定义为其他两种作用域，需要额外的配置。Midway 提供了 `@Scope` 装饰器来定义一个类的作用域。下面的代码就将我们的 user 服务变成了一个全局唯一的实例。


```typescript
// service
import { Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()	
@Scope(ScopeEnum.Singleton)
export class UserService {
  //...
}
```

:::info
默认为请求作用域的目的是为了和请求上下文关联，显式传递 ctx 更为安全可靠，方便调试。
:::


我们的 `@Inject` 装饰器也是在**当前类的作用域**下去寻找对象来注入的。比如，在  `Singleton` 作用域下，由于和请求不关联 ，默认没有 `ctx` 对象，所以注入 ctx  是不对的 。
```typescript
@Provide()	
@Scope(ScopeEnum.Singleton)
export class UserService {
  
  @Inject()
  ctx;								// undefined
  //...
}
```



### 单例的限制


当作用域被设置为单例（Singleton）之后，整个 Class 注入的对象在第一次实例化之后就已经被固定了，这意味着，单例中注入的内容不能是其他作用域。


我们来举个例子。
```typescript
// 这个类是默认的请求作用域（Request）
@Provide()
export class HomeController {
  @Inject()
  userService: UserService;
}


// 设置了单例，进程级别唯一
@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {
	async getUser() {
  	// ...
  }
}
```
调用的情况如下。
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01FN99rS1Xb1YydSFi0_!!6000000002941-2-tps-1110-388.png)
这种情况下，不论调用 `HomeController` 多少次，每次请求的 `HomeController` 实例是不同的，而 `UserService` 都会固定的那个。


我们再来举个例子演示单例中注入的服务是否还会保留原有作用域。

:::info
这里的 `DBManager` 我们特地设置成请求作用域，来演示一下特殊场景。
:::
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01eAyxrC1xVEYzbNf9P_!!6000000006448-2-tps-1964-334.png)

```typescript
// 这个类是默认的请求作用域（Request）
@Provide()
export class HomeController {
  @Inject()
  userService: UserService;
}


// 设置了单例，进程级别唯一
@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {
  
  @Inject()
  dbManager: DBManager;
  
  async getUser() {
  	// ...
  }
}

// 未设置作用域，默认是请求作用域（这里用来验证单例链路下，后续的实例都被缓存的场景）
@Provide()
export class DBManager {
}

```
这种情况下，不论调用 `HomeController` 多少次，每次请求的 `HomeController` 实例是不同的，而 `UserService` 和 `DBManager` 都会固定的那个。

![image.png](https://img.alicdn.com/imgextra/i2/O1CN01UoLu1526stZQFhp1U_!!6000000007718-2-tps-1870-762.png)
简单的理解为，单例就像一个缓存，**其中依赖的所有对象都将被冻结，不再变化。**



## 异步初始化


在某些情况下，我们需要一个实例在被其他依赖调用前需要初始化，如果这个初始化只是读取某个文件，那么可以写成同步方式，而如果这个初始化是从远端拿取数据或者连接某个服务，这个情况下，普通的同步代码就非常的难写。


Midway 提供了异步初始化的能力，通过 `@Init` 标签来管理初始化方法。


`@Init` 方法目前只能是一个。


```typescript
@Provide()
export class BaseService {

  @Config('hello')
  config;

  @Plugin('plugin2')
  plugin2;

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


等价于
```typescript
const service = new BaseService();
await service.init();
```

:::info
@Init 装饰器标记的方法，一定会以异步方式来调用。一般来说，异步初始化的服务较慢，请尽可能标注为单例（@Scope(ScopeEnum.Singleton))。
:::



## 获取依赖注入容器


在一般情况下，用户无需关心依赖注入容器，但是在一些特殊场景下，比如


- 需要动态调用服务的，比如 Web 的中间件场景，启动阶段需要调用服务的
- 封装框架或者其他三方 SDK 中需要动态获取服务的

简单来说，任意需要 **通过 API 动态获取服务** 的场景，都需要先拿到依赖注入容器。


Midway 将依赖注入容器挂载在两个地方，框架的 app 以及每次请求的上下文 Context，由于不同上层框架的情况不同，我们这里列举一下常见的示例。


对于不同的上层框架，我们统一提供了 `IMidwayApplication` 定义，所有的上层框架 app 都会实现这个接口，定义如下。
```typescript
export interface IMidwayApplication {
  getApplicationContext(): IMidwayContainer;
  //...
}
```
即通过 `app.getApplicationContext()` 方法，我们都能获取到依赖注入容器。
```typescript
const container = app.getApplicationContext();
```
配合 `@App` 装饰器，我们可以方便的在任意地方拿到当前运行的 app 实例。
```typescript
import { App } from '@midwayjs/decorator';
import { IMidwayApplication } from '@midwayjs/core';

@Provide() 
export class BootApp {
  
  @App()
  app: IMidwayApplication;				// 这里也可以换成实际的框架的 app 定义
  
  async ready() {
  
    // 获取依赖注入容器
  	const container = this.app.getApplicationContext();
  
  }

}
```


除了普通的依赖注入容器之外，Midway 还提供了一个 **请求链路的依赖注入容器，**这个请求链路的依赖注入容器和全局的依赖注入容器关联，共享一个对象池。但是还有有所区别。


请求链路的依赖注入容器，是为了获取特有的请求作用域的对象，这个容器中获取的对象，都是**和请求绑定**，关联了当前的上下文。这意味着，**如果 Class 代码和请求关联，必须要从这个请求链路的依赖注入容器中获取**。


请求链路的依赖注入容器，必须从请求上下文对象中获取，最常见的场景为 Web 中间件。


```typescript
@Provide()
export class ReportMiddleware {

  resolve() {
  	return async(ctx, next) => {
      // ctx.requestContext  请求链路的依赖注入容器
    	await next();
    }
  }
}
```
Express 的请求链路依赖注入容器挂载在 req 对象上。
```typescript
@Provide()
export class ReportMiddleware {

  resolve() {
  	return (req, res, next) => {
      // req.requestContext  请求链路的依赖注入容器
    	next();
    }
  }
}
```


## 动态获取服务等实例


拿到 **依赖注入容器 **或者 **请求链路的依赖 **注入容器之后，才可以通过容器的 API 获取到对象。
```typescript
import { UserService, Middleware } from './service/user';

@Middleware()
export class ReportMiddleware {

	@App()
  app: IMidwayApplication;
  
  resolve() {
  	return async(ctx, next) => {
      const container = app.getApplicationContext();
      
      // 下面的方法等价，获取的对象和请求不关联，没有 ctx 上下文
      const userService1 = await container.getAsync<UserService>('userService');
      const userService2 = await container.getAsync<UserService>(UserService);
      // 如果传入 class，这么写也能推导出正确的类型
      const userService2 = await container.getAsync(UserService);

      // 下面的方法获取的服务和请求关联，可以注入上下文
      const userService = await ctx.requestContext.getAsync<UserService>(UserService);
    	await next();
    }
  }
}
```


Express 的写法
```typescript
import { UserService, Middleware } from './service/user';

@Middleware()
export class ReportMiddleware {

	@App()
  app: IMidwayApplication;
  
  resolve() {
  	return (req, res, next) => {
      req.requestContext.getAsync<UserService>(UserService).then((userService) => {
        // do something
        next();
      });
    }
  }
}
```



## 注入已有对象


有时候，应用已经有现有的实例，而不是类，比如引入了一个第三库，这个时候如果希望对象能够被其他 IoC 容器中的实例引用，也可以通过增加对象的方式进行处理。


我们拿常见的 http 请求库 [urllib](https://www.npmjs.com/package/urllib) 来举例。


假如我们希望在不同的类中来使用，并且不通过 require 的方式，你需要在业务调用前（一般在启动的生命周期中）通过 `registerObject` 方法添加这个对象。


在添加的时候需要给出一个 **标识符**，方便其他类中注入。


```typescript
// in global file
import * as urllib from 'urllib';
import { Configuration } from '@midwayjs/decorator';

@Configuration()
export class AutoConfiguration {
  
  @App()
  app: IMidwayApplication;
  
	async onReady() {
    // 注入一些全局对象
  	this.app.getApplicationContext().registerObject('httpclient', urllib);
  }
}


```


这个时候就可以在任意的类中通过 `@Inject` 来使用了。


```typescript
@Provide()
export class BaseService {

  @Inject()
  httpclient;

  async getUser() {
    return await this.httpclient.request('/api/getuser');
  }
}
```


## 动态函数注入


在某些场景下，我们需要函数作为某个逻辑动态执行，而依赖注入容器中的对象属性则都是已经创建好的，无法满足动态的逻辑需求。


比如你需要一个工厂函数，根据不同的场景返回不同的实例，也可能有一个三方包，是个函数，在业务中想要直接调用，种种的场景下，你就需要直接注入一个工厂方法，并且在函数中拿到上下文，动态去生成实例。


下面是标准的工厂方法注入样例。


一般工厂方法用于返回相同接口的实现，比如我们有两个 `ICacheService` 接口的实现：
```typescript
export interface  ICacheService {
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
然后可以定义一个动态服务（工厂），根据当前的用户配置返回不同的实现。
```typescript
// src/service/dynamicCacheService.ts

import { providerWrapper, IMidwayContainer } from '@midwayjs/core';

export async function dynamicCacheServiceHandler(container: IMidwayContainer) {
  // 从容器 API 获取全局配置
  const config = container.getConfigService().getConfiguration();
  if (config['redis']['mode'] === 'local') {
    return await container.getAsync('localCacheService');
  } else {
    return await container.getAsync('remoteCacheService');
  }
}

providerWrapper([
  {
    id: 'dynamicCacheService',
    provider: dynamicCacheServiceHandler,
    scope: ScopeEnum.Request,			  // 设置为请求作用域，那么上面传入的容器就为请求作用域容器
    // scope: ScopeEnum.Singleton,	// 也可以设置为全局作用域，那么里面的调用的逻辑将被缓存
  }
]);
```


这样在业务中，可以直接来使用了。注意：在注入的时候，方法会**被调用后再注入**。


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


通过 `providerWrapper` 我们将一个原本的函数写法进行了包裹，和现有的依赖注入体系可以融合到一起，让容器能够统一管理。


:::info
注意，动态方法必须 export，才会被依赖注入扫描到，默认为请求作用域（获取的 Container 是请求作用域容器）。
:::


由于我们能将动态方法绑定到依赖注入容器，那么也能将一个回调方法绑定进去，这样获取的方法是可以被执行的，我们可以根据业务的传参来决定返回的结果。
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

providerWrapper([
  {
    id: 'cacheServiceHandler',
    provider: cacheServiceHandler,
    scope: ScopeEnum.Singleton,
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


## 依赖注入容器的默认对象


Midway 会默认注入一些值，方便业务直接使用。

| **标识符** | **值类型** | **作用域** | **描述** |
| --- | --- | --- | --- |
| baseDir | string | 全局 | 本地使用 ts-node 开发时为 src 目录，否则为 dist 目录 |
| appDir | string | 全局 | 应用的根路径，一般为 process.cwd() |
| ctx | object | 请求链路 | 对应框架的上下文类型，比如 EggJS 和 Koa 的 Context，Express 的 req |
| logger | object | 请求链路 | 在 EggJS 下等价于 ctx.logger |
| req | object | 请求链路 | Express 特有 |
| res | object | 请求链路 | Express 特有 |
| socket | object | 请求链路 | WebSocket 场景特有 |

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



## 静态 API


在有些工具类中，我们可以不需要创建 class 实例就能获取到全局的依赖注入容器（**在使用 bootstrap.js 启动之后**）。
```typescript
import { getCurrentApplicationContext } from '@midwayjs/core';

export const getService = async (serviceName) => {
	return getCurrentApplicationContext().getAsync(serviceName);
}
```


获取主框架（**在使用 bootstrap.js 启动之后**）。
```typescript
import { getCurrentMainFramework } from '@midwayjs/core';

export const framework = () => {
	return getCurrentMainFramework();
}
```
获取主框架的 app 对象（**在使用 bootstrap.js 启动之后**）。
```typescript
import { getCurrentMainApp } from '@midwayjs/core';

export const getGlobalConfig = () => {
	return getCurrentMainApp().getConfig();
}
```



## 面向接口编程


Midway 也可以基于接口进行注入，但是由于 Typescirpt 编译后会移除接口类型，不如使用类作为定义好用。

比如，我们定义一个接口，以及它的实现类。
```typescript
export interface IPay {
	payMoney()
}

@Provide('WeChatPay')
export class WeChatPay implements IPay {
	async payMoney() {
  	// ...
  }
}

@Provide('AlipayPay')
export class AlipayPay implements IPay {
	async payMoney() {
  	// ...
  }
}
```
这个时候，如果有个服务需要注入，可以使用下面显式声明的方式。
```typescript
@Provide()
export class PaymentService {
  
  @Inject('AlipayPay')
  payService: IPay;			// 注意，这里的类型是接口，编译后类型信息会被移除

  async orderGood {
  	await this.payService.payMonety();
  }
  
}
```
由于接口类型会被移除，Midway 只能通过 `@Inject` 装饰器的 **参数** 或者 **属性名** 类来匹配注入的对象信息，类似 Java Spring 中的 `Autowire by name` 。

上述就是 **静态 **的面向接口注入的方式。

如果需要动态，也和 [动态函数注入](动态函数注入) 描述的一致，注入方法来使用。



## 常见的使用错误


### 错误：构造器中获取注入属性


**请不要在构造器中 **获取注入的属性，这会使得拿到的结果为 undefined。原因是装饰器注入的属性，都在实例创建后（new）才会赋值。这种情况下，请使用 `@Init` 装饰器。
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



## 关于继承


为了避免属性错乱，请不要在基类上使用 `@Provide` 装饰器。


现阶段，Midway 支持属性装饰器的继承，不支持类和方法装饰器的继承（会有歧义）。