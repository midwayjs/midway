# 依赖注入

Midway 中使用了非常多的依赖注入的特性，通过装饰器的轻量特性，让依赖注入变的优雅，从而让开发过程变的便捷有趣。


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


在上面的示例中，提供了两个文件， `user.controller.ts` 和 `user.service.ts` 。

:::tip
下面的示例，为了展示完整的功能，我们会写完整的 `@Provide` 装饰器，而在实际使用中，如果有其他装饰器（比如 `@Controller` ）的情况下， `@Provide` 可以被省略。
:::


为了解释方便，我们将它合并到了一起，内容大致如下。


```typescript
import { Provide, Inject, Get } from '@midwayjs/core';

// user.controller.ts
@Provide()	// 实际可省略
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



## 依赖注入作用域


默认的未指定或者未声明的情况下，所有的 `@Provide` 出来的 Class 的作用域都为 **请求作用域**。这意味着这些 Class ，会在**每一次请求第一次调用时被实例化（new），请求结束后实例销毁。**我们默认情况下的控制器（Controller）和服务（Service）都是这种作用域。

在 Midway 的依赖注入体系中，有三种作用域。

| 作用域    | 描述                                                         |
| --------- | ------------------------------------------------------------ |
| Singleton | 单例，全局唯一（进程级别）                                   |
| Request   | **默认**，请求作用域，生命周期绑定 **请求链路**，实例在请求链路上唯一，请求结束立即销毁 |
| Prototype | 原型作用域，每次调用都会重复创建一个新的对象                 |

不同的作用域有不同的作用，**单例 **可以用来做进程级别的数据缓存，或者数据库连接等只需要执行一次的工作，同时单例由于全局唯一，只初始化一次，所以调用的时候速度比较快。而 **请求作用域 **则是大部分需要获取请求参数和数据的服务的选择，**原型作用域 **使用比较少，在一些特殊的场景下也有它独特的作用。



### 配置作用域


如果我们需要将一个对象定义为其他两种作用域，需要额外的配置。Midway 提供了 `@Scope` 装饰器来定义一个类的作用域。下面的代码就将我们的 user 服务变成了一个全局唯一的实例。


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

注意，所有的入口类，比如 Controller，均为请求作用域，不支持修改。大部分情况下，只需要调整 Service 即可。

:::



### 单例作用域

在显式配置后，某个类的作用域就可以变成单例作用域。。

```typescript
// service
import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {
  //...
}

```

后续不管获取这个类的实例多少次，在 **同一个进程下**，都是同一个实例。

比如基于上面的单例服务，下面两个注入的 `userService` 属性是同一个实例：

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

在 v3.10 版本之后，可以使的单例装饰器来简化原来的写法。

```typescript
import { Singleton } from '@midwayjs/core';

@Singleton()
class UserService {
  // ...
}
```



### 请求作用域

默认情况下，代码中编写的类均为 **请求作用域**。

在每个协议入口框架会自动创建一个请求作用域下的依赖注入容器，所有创建的实例都会绑定当前协议的上下文。

比如：

- http 请求进来的时候，会创建一个请求作用域，每个 Controller 都是在请求路由时动态创建
- 定时器触发，也相当于创建了请求作用域 ctx，我们可以通过@Inject()ctx可以拿到这个请求作用域。

:::info
默认为请求作用域的目的是为了和请求上下文关联，显式传递 ctx 更为安全可靠，方便调试。
:::

所以在请求作用域中，我们可以通过 `@Inject()` 来注入当前的 ctx 对象。

```typescript
import { Controller, Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Provide()	// 实际可省略
@Controller('/user')
export class UserController {

  @Inject()
  ctx: Context;
  //...
}
```




我们的 `@Inject` 装饰器也是在 **当前类的作用域** 下去寻找对象来注入的。比如，在  `Singleton` 作用域下，由于和请求不关联 ，默认没有 `ctx` 对象，所以注入 ctx  是不对的 。

```typescript
@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {

  @Inject()
  ctx;								// undefined
  //...
}
```



### 作用域固化


当作用域被设置为单例（Singleton）之后，整个 Class 注入的对象在第一次实例化之后就已经被固定了，这意味着，单例中注入的内容不能是其他作用域。


我们来举个例子。
```typescript
// 这个类是默认的请求作用域（Request）
@Provide()		// 实际可省略
@Controller()
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



### 作用域降级

上面提到，当单例作用域注入请求作用域对象时，请求作用域的对象实例将被固化，会保存一个固定的实例在单例的缓存中。

这个时候，请求作用域变为单例，出现 **作用域降级** 的情况。

在日常开发中，一不留神就会发生这种情况，比如中间件中调用服务。

```typescript
//下面这段是错误的示例

@Provide()
export class UserService {
  @Inject()
  ctx: Context;

  async getUser() {
    const id = this.ctx.xxxx;
    // ctx not found, will throw error
  }
}

// 中间件是单例
@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  userService: UserService;		// 这里的用户服务是请求作用域

  resolve() {
  	return async(ctx, next) => {
      await this.userService.getUser();
      // ...
    }
  }
}
```

这个时候，虽然 `UserService` 可以正常注入中间件，但是实际上是以 单例 的对象注入，而不是请求作用域的对象，会导致 `ctx` 为空的情况。

这个时候的内存对象图为：

![](https://img.alicdn.com/imgextra/i3/O1CN01SwATKb1zUtVUCaQGj_!!6000000006718-2-tps-1292-574.png)

`UserService` 的实例变成了不同的对象，一个是单例调用的实例（单例，不含 ctx），一个是正常的请求作用域调用的实例（请求作用域，含 ctx）。

为了避免发生这种情况，默认在这类错误的注入时，框架会自动抛出名为 `MidwaySingletonInjectRequestError` 的错误，阻止程序执行。

如果用户了解其中的风险，明确需要在单例中调用请求作用域对象，可以通过作用域装饰器的参数来设置允许降级。

并在其中做好 `ctx` 的空对象判断。

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

当然，如果只是误写，那可以使用动态的获取方式，使得作用域统一。

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


## 注入规则

Midway 支持多种方式的注入。

### 基于 Class 的注入

导出一个 Class，注入的类型使用 Class，这是最简单的注入方式，大部分的业务和组件都是使用这样的方式。

```typescript
import { Provide, Inject } from '@midwayjs/core';

@Provide()               // <------ 暴露一个 Class
export class B {
  //...
}

@Provide()
export class A {

  @Inject()
  b: B;                  // <------ 这里的属性使用 Class

  //...
}
```

Midway 会自动使用 B 作为 b 这个属性的类型，在容器中实例化它。

在这种情况下，Midway 会自动创建一个唯一的 uuid 关联这个 Class，同时这个 uuid 我们称为 **依赖注入标识符**。


默认情况：


- 1、 `@Provide` 会自动生成一个 uuid 作为依赖注入标识符
- 2、 `@Inject` 根据类型的 uuid 来查找

如果要获取这个 uuid，可以使用下面的 API。

```typescript
import { getProviderUUId } from '@midwayjs/core';

const uuid = getProviderUUId(B);
// ...
```



### 基于固定名字的注入

```typescript
import { Provide, Inject } from '@midwayjs/core';

@Provide('bbbb')        // <------ 暴露一个 Class
export class B {
  //...
}

@Provide()
export class A {

  @Inject('bbbb')
  b: B;                  // <------ 这里的属性使用 Class

  //...
}
```

Midway 会将 `bbbb` 作为 B 这个 Class 的依赖注入标识符，在容器中实例化它。这种情况下，即使写了类型 B，依赖注入容器依旧会查找 `bbbb` 。

`@Provide` 和 `@Inject` 装饰器的参数是成对出现。

规则如下：


- 1、如果装饰器包含参数，则以 **参数 **作为依赖注入标识符
- 2、如果没有参数，标注的 TS 类型为 Class，则将类 `@Provide` 的 key 作为 key，如果没有 key，默认取 uuid
- 3、如果没有参数，标注的 TS 类型为非 Class，则将 **属性名** 作为 key



### 基于属性名的注入

Midway 也可以基于接口进行注入，但是由于 Typescirpt 编译后会移除接口类型，不如使用类作为定义好用。

比如，我们定义一个接口，以及它的实现类。

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

这个时候，如果有个服务需要注入，可以使用下面显式声明的方式。

```typescript
@Provide()
export class PaymentService {

  @Inject('APay')
  payService: IPay;         // 注意，这里的类型是接口，编译后类型信息会被移除

  async orderGood() {
    await this.payService.payMoney();
  }

}
```

由于接口类型会被移除，Midway 只能通过 `@Inject` 装饰器的 **参数** 或者 **属性名** 类来匹配注入的对象信息，类似 Java Spring 中的 `Autowire by name` 。

### 注入已有对象


有时候，应用已经有现有的实例，而不是类，比如引入了一个第三库，这个时候如果希望对象能够被其他 IoC 容器中的实例引用，也可以通过增加对象的方式进行处理。


我们拿常见的工具类库 lodash 来举例。

假如我们希望在不同的类中直接注入来使用，而不是通过 require 的方式。

你需要在业务调用前（一般在启动的生命周期中）通过 `registerObject` 方法添加这个对象。


在添加的时候需要给出一个 **依赖注入标识符**，方便其他类中注入。


```typescript
// src/configuration.ts
import * as lodash from 'lodash';
import { Configuration, IMidwayContainer } from '@midwayjs/core';

@Configuration()
export class MainConfiguration {

  async onReady(applicationContext: IMidwayContainer) {
    // 向依赖注入容器中添加一些全局对象
  	applicationContext.registerObject('lodash', lodash);
  }
}

```


这个时候就可以在任意的类中通过 `@Inject` 来使用了。


```typescript
@Provide()
export class BaseService {

  @Inject('lodash')
  lodashTool;

  async getUser() {
    // this.lodashTool.defaults({ 'a': 1 }, { 'a': 3, 'b': 2 });
  }
}
```



### 注入默认标识符


Midway 会默认注入一些值，方便业务直接使用。

| **标识符** | **值类型** | **作用域** | **描述**                                                     |
| ---------- | ---------- | ---------- | ------------------------------------------------------------ |
| baseDir    | string     | 全局       | 本地开发时为 src 目录，否则为 dist 目录                      |
| appDir     | string     | 全局       | 应用的根路径，一般为 process.cwd()                           |
| ctx        | object     | 请求链路   | 对应框架的上下文类型，比如 Koa 和 EggJS 的 Context，Express 的 req |
| logger     | object     | 请求链路   | 等价于 ctx.logger                                            |
| req        | object     | 请求链路   | Express 特有                                                 |
| res        | object     | 请求链路   | Express 特有                                                 |
| socket     | object     | 请求链路   | WebSocket 场景特有                                           |

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



## 获取依赖注入容器


在一般情况下，用户无需关心依赖注入容器，但是在一些特殊场景下，比如


- 需要动态调用服务的，比如 Web 的中间件场景，启动阶段需要调用服务的
- 封装框架或者其他三方 SDK 中需要动态获取服务的

简单来说，任意需要 **通过 API 动态获取服务** 的场景，都需要先拿到依赖注入容器。

### 从 @ApplicationContext() 装饰器中获取

在新版本中，Midway 提供了一个 @ApplicationContext() 的装饰器，用来获取依赖注入容器。

```typescript
import { ApplicationContext, IMidwayContainer } from '@midwayjs/core';
import { IMidwayContainer } from '@midwayjs/core';

@Provide()
export class BootApp {

  @ApplicationContext()
  applicationContext: IMidwayContainer;				// 这里也可以换成实际的框架的 app 定义

  async invoke() {

    // this.applicationContext

  }

}
```



### 从 app 中获取


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
import { App, IMidwayApplication } from '@midwayjs/core';

@Provide()
export class BootApp {

  @App()
  app: IMidwayApplication;				// 这里也可以换成实际的框架的 app 定义

  async invoke() {

    // 获取依赖注入容器
  	const applicationContext = this.app.getApplicationContext();

  }

}
```


除了普通的依赖注入容器之外，Midway 还提供了一个 **请求链路的依赖注入容器，**这个请求链路的依赖注入容器和全局的依赖注入容器关联，共享一个对象池。但是两者还是有所区别的。


请求链路的依赖注入容器，是为了获取特有的请求作用域的对象，这个容器中获取的对象，都是**和请求绑定**，关联了当前的上下文。这意味着，**如果 Class 代码和请求关联，必须要从这个请求链路的依赖注入容器中获取**。


请求链路的依赖注入容器，必须从请求上下文对象中获取，最常见的场景为 Web 中间件。


```typescript
@Middleware()
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
@Middleware()
export class ReportMiddleware {

  resolve() {
  	return (req, res, next) => {
      // req.requestContext  请求链路的依赖注入容器
      next();
    }
  }
}
```



### 在 Configuration 中获取

在代码的入口 `configuration` 文件的生命周期中，我们也会额外传递依赖注入容器参数，方便用户直接使用。

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



## 动态 API



### 动态获取实例

拿到 **依赖注入容器 **或者 **请求链路的依赖 **注入容器之后，才可以通过容器的 API 获取到对象。

我们可以使用标准的依赖注入容器 API 来获取实例。

```typescript
// 全局容器，获取的是单例
const userSerivce = await applicationContext.getAsync(UserService);

// 请求作用域容器，获取请求作用域实例
const userSerivce = await ctx.requestContext.getAsync(UserService);
```

我们可以在任意能获取依赖注入容器的地方使用，比如中间件中。

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
      // 指定泛型类型，比如某个接口
      const userService1 = await this.applicationContext.getAsync<UserService>(UserService);
      // 不写泛型，也能推导出正确的类型
      const userService1 = await this.applicationContext.getAsync(UserService);

      // 下面的方法获取的服务和请求关联，可以注入上下文
      const userService2 = await ctx.requestContext.getAsync<UserService>(UserService);
      await next();
    }
  }
}
```


Express 的写法
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



### 传递构造器参数

在个别场景下，我们可以通过 `getAsync` 获取实例的时候，传递构造器的参数。普通装饰器模式无法做到，仅在 API 形式下可用。

```typescript
@Provide()
class UserService {
  constructor(private readonly type) {}

  getUser() {
    // this.type => student
  }
}

// 全局容器，获取的是单例
const userSerivce = await applicationContext.getAsync(UserService, [
  'student', // 构造器参数，会 apply 到构造器中
]);

// 请求作用域容器，获取请求作用域实例
const userSerivce = await ctx.requestContext.getAsync(UserService, [
  'student'
]);
```

注意，构造器不能使用注入形式传递实例，只能传递固定的值。




### 动态函数注入


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

import { providerWrapper, IMidwayContainer, MidwayConfigService } from '@midwayjs/core';

export async function dynamicCacheServiceHandler(container: IMidwayContainer) {
  // 从容器 API 获取全局配置
  const config = container.get(MidwayConfigService).getConfiguration();
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



## 静态 API


在有些工具类中，我们可以不需要创建 class 实例就能获取到全局的依赖注入容器（**在启动之后**）。
```typescript
import { getCurrentApplicationContext } from '@midwayjs/core';

export const getService = async (serviceName) => {
  return getCurrentApplicationContext().getAsync(serviceName);
}
```


获取主框架（**在启动之后**）。
```typescript
import { getCurrentMainFramework } from '@midwayjs/core';

export const framework = () => {
  return getCurrentMainFramework();
}
```
获取主框架的 app 对象（**在启动之后**）。
```typescript
import { getCurrentMainApp } from '@midwayjs/core';

export const getGlobalConfig = () => {
  return getCurrentMainApp().getConfig();
}
```



## 启动行为

### 自动扫描绑定

上面提到，在容器初始化之后，我们会将现有的 class 注册绑定到容器中。

```typescript
const container = new MidwayContainer();
container.bind(UserController);
container.bind(UserService);
```

Midway 在启动过程中会自动扫描整个项目目录，自动处理这个行为，使得用户无需手动执行绑定的操作。

简单的来说，框架默认会递归扫描整个 `src` 目录下的 ts/js 文件，然后进行 require 操作，当文件导出的为 class，且显式或隐式包含 `@Provide()` 装饰器时，会执行 `container.bind` 逻辑。



### 忽略扫描

一般情况下，我们不应该把非 ts 文件放在 src 下（比如前端代码），特殊场景下，我们可以忽略某些目录，可以在 `@Configuration` 装饰器中配置。

示例如下：

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





## 对象生命周期

在依赖注入容器创建和销毁实例的时候，我们可以使用装饰器做一些自定义的操作。



### 异步初始化


在某些情况下，我们需要一个实例在被其他依赖调用前需要初始化，如果这个初始化只是读取某个文件，那么可以写成同步方式，而如果这个初始化是从远端拿取数据或者连接某个服务，这个情况下，普通的同步代码就非常的难写。


Midway 提供了异步初始化的能力，通过 `@Init` 标签来管理初始化方法。

`@Init` 方法目前只能是一个。


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


等价于

```typescript
const service = new BaseService();
await service.init();
```

:::info
@Init 装饰器标记的方法，一定会以异步方式来调用。一般来说，异步初始化的服务较慢，请尽可能标注为单例（@Scope(ScopeEnum.Singleton))。
:::



### 异步销毁

Midway 提供了在对象销毁前执行方法的能力，通过 `@Destroy` 装饰器来管理方法。

`@Destroy` 方法目前只能是一个。


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



## 请求作用域中的上下文对象

在请求作用域创建的对象，框架会在对象上挂载一个上下文对象，即使对象未显式声明 `@Inject() ctx` 也能获取当前上下文对象。

```typescript
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';

@Provide()
export class UserManager {
  // ...
}

@Provide()
export class UserService {
  // ...

  @Inject()
  userManager: UserManager;

  async invoke() {
    const ctx = this.userManager[REQUEST_OBJ_CTX_KEY];
    // ...
  }
}
```

这个特性在 [拦截器](./aspect) 或者 [自定义方法装饰器](./custom_decorator) 中很有用。



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



### 关于继承


为了避免属性错乱，请不要在基类上使用 `@Provide` 装饰器。


现阶段，Midway 支持属性装饰器的继承，不支持类和方法装饰器的继承（会有歧义）。
