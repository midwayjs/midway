# 自定义装饰器

在新版本中，Midway 提供了由框架支持的自定义装饰器能力，它包括几个常用功能：

- 定义可继承的属性装饰器
- 定义可包裹方法，做拦截的方法装饰器
- 定义修改参数的参数装饰器



我们考虑到了装饰器当前在标准中的阶段以及后续风险，Midway 提供的自定义装饰器方式及其配套能力由框架实现，以尽可能的规避后续规范变化带来的问题。



一般，我们推荐将自定义装饰器放到 `src/decorator` 目录中。

比如：

```
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   ├── user.controller.ts
│   │   └── home.controller.ts
│   ├── interface.ts
│   ├── decorator                   ## 自定义装饰器
│   │   └── user.decorator.ts
│   └── service
│       └── user.service.ts
├── test
├── package.json
└── tsconfig.json
```



## 装饰器 API

Midway 内部有一套标准的装饰器管理 API，用来将装饰器对接依赖注入容器，实现扫描和扩展，这些 API 方法我们都从 `@midwayjs/decorator` 包进行导出。

通过装饰器高级 API，我们可以自定义装饰器，并且将元数据附加其中，内部的各种装饰器都是通过该能力实现的。

常见的扩展 API 有:

**装饰器**

- `saveModule` 用于保存某个类到某个装饰器
- `listModule` 获取所有绑定到某类型装饰器的 class

**元信息存取 （对应** [**reflect-metadata**](https://www.npmjs.com/package/reflect-metadata)**)**

- `saveClassMetadata` 保存元信息到 class
- `attachClassMetadata` 附加元信息到 class
- `getClassMetadata` 从 class 获取元信息
- `savePropertyDataToClass`  保存属性的元信息到 class
- `attachPropertyDataToClass` 附加属性的元信息到 class
- `getPropertyDataFromClass` 从 class 获取属性元信息
- `listPropertyDataFromClass` 列出 class 上保存的所有的属性的元信息
- `savePropertyMetadata` 保存属性元信息到属性本身
- `attachPropertyMetadata` 附加属性元信息到属性本身
- `getPropertyMetadata`  从属性上获取保存的元信息

**快捷操作**

- `getProviderUUId`获取 class provide 出来的 uuid，对应某个类，不会变
- `getProviderName` 获取 provide 时保存的 name，一般为类名小写

- `getProviderId` 获取 class 上 provide 出来的 id，一般为类名小写，也可能是自定义的 id
- `isProvide` 判断某个类是否被 @Provide 修饰过
- `getObjectDefinition` 获取对象定义（ObjectDefiniton)
- `getParamNames` 获取一个函数的所有参数名
- `getMethodParamTypes` 获取某个方法的参数类型，等价于 `Reflect.getMetadata(design:paramtypes)`
- `getPropertyType` 获取某个属性的类型，等价于 `Reflect.getMetadata(design:type)`
- `getMethodReturnTypes` 获取方法返回值类型，等价于 `Reflect.getMetadata(design:returntype)`



## 类装饰器

一般类装饰器都会和其他装饰器配合使用，用来标注某个类属于特定的一种场景，比如 `@Controller` 表示了类属于 Http 场景的入口。

我们举一个例子，定义一个类装饰器 @Model ，标识 class 是一个模型类，然后进一步操作。

首先创建一个装饰器文件，比如 `src/decorator/model.decorator.ts` 。

```typescript
import { Scope, ScopeEnum, saveClassMetadata, saveModule, Provide } from '@midwayjs/decorator';

// 提供一个唯一 key
const MODEL_KEY = 'decorator:model';

export function Model(): ClassDecorator {
  return (target: any) => {
    // 将装饰的类，绑定到该装饰器，用于后续能获取到 class
    saveModule(MODEL_KEY, target);
    // 保存一些元数据信息，任意你希望存的东西
    saveClassMetadata(
      MODEL_KEY,
      {
        test: 'abc',
      },
      target
    );
    // 指定 IoC 容器创建实例的作用域，这里注册为请求作用域，这样能取到 ctx
    Scope(ScopeEnum.Request)(target);
    
    // 调用一下 Provide 装饰器，这样用户的 class 可以省略写 @Provide() 装饰器了
    Provide()(target);
  };
}
```



上面只是定了了这个装饰器，我们还要实现相应的功能，midway v2 开始有生命周期的概念，可以在 `configuration` 中的生命周期中执行。

```typescript
// src/configuration.ts

import { listModule, Configuration, App, Inject } from '@midwayjs/decorator';
import { join } from 'path';
import * as koa from '@midwayjs/koa';
import { MODEL_KEY } from './decorator/model.decorator'

@Configuration({
  imports: [
    koa
  ],
})
export class ContainerConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    // ...
    
    // 可以获取到所有装饰了 @Model() 装饰器的 class
    const modules = listModule(MODEL_KEY);
    for (let mod of modules) {
      // 实现自定义能力
      // 比如，拿元数据 getClassMetadata(mod)
      // 比如，提前初始化 app.applicationContext.getAsync(mod);
    }
  }
}

```



最后，我们要使用这个装饰器。

```typescript
import { Model } from '../decorator/model.decorator';

// Model 的作用是我们自己的逻辑能被执行（保存的元数据）
@Model()
export class UserModel {
  // ...
}
```



## 属性装饰器

Midway 提供了 `createCustomPropertyDecorator` 方法，用于创建自定义属性装饰器，框架的 `@Logger` ，`@Config` 等装饰器都是这样创建而来的。

和 TypeScript 中定义的装饰器不同的是，Midway 提供的属性装饰器，可以在继承中使用。



我们举个例子，假如现在有一个内存缓存，我们的属性装饰器用于获取缓存数据，下面是一些准备工作。

```typescript
// 简单的缓存类
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
// 入口实例化，并保存一些数据
import { Configuration, App, Inject } from '@midwayjs/decorator';
import { join } from 'path';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [
    koa
  ],
})
export class ContainerConfiguration {

  @App()
  app: koa.Application;
  
  @Inject()
  store: MemoryStore;

  async onReady() {
    // ...
    
    // 初始化一些数据
    store.save('aaa', 1);
    store.save('bbb', 1);
  }
}
```



我们来实现一个简单的 `@MemoryCache()` 装饰器。属性装饰器的实现分为两部分：

- 1、定义一个装饰器方法，一般只保存元数据
- 2、定义一个实现，在装饰器逻辑执行前即可



下面是定义装饰器方法的部分。

```typescript
// src/decorator/memoryCache.decorator.ts
import { createCustomPropertyDecorator } from '@midwayjs/decorator';

// 装饰器内部的唯一 id
export const MEMORY_CACHE_KEY = 'decorator:memory_cache_key';

export function MemoryCache(key?: string): PropertyDecorator {
  return createCustomPropertyDecorator(MEMORY_CACHE_KEY, {
    key,
  });
}
```



在装饰器的方法执行之前（一般在初始化的地方）去实现。实现装饰器，我们需要用到内置的 `MidwayDecoratorService` 服务。

```typescript
import { Configuration, App, Inject } from '@midwayjs/decorator';
import { join } from 'path';
import * as koa from '@midwayjs/koa';
import { MEMORY_CACHE_KEY } from 'decorator/memoryCache.decorator';

@Configuration({
  imports: [
    koa
  ],
})
export class ContainerConfiguration {

  @App()
  app: koa.Application;
  
  @Inject()
  store: MemoryStore;
  
  @Inject()
  decoratorService: MidwayDecoratorService;

  async onReady() {
    // ...
    
    // 实现装饰器
    this.decoratorService.registerPropertyHandler(
      MEMORY_CACHE_KEY,
      (propertyName, meta) => {
        return this.store.get(meta.key);
      }
    );
  }
}
```

`registerPropertyHandler` 方法包含两个参数，第一个是之前装饰器定义的唯一 id，第二个是装饰器实现的回调方法。

`propertyName` 是装饰器装饰的方法名，meta 是装饰器的使用时的参数。

然后我们就能使用这个装饰器了。

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



## 方法装饰器

Midway 提供了 `createCustomMethodDecorator` 方法，用于创建自定义方法装饰器。

和 TypeScript 中定义的装饰器不同的是，Midway 提供的方法装饰器，由拦截器统一实现，和其他拦截方式不冲突，并且更加简单。



我们以打印方法执行时间为例。

和属性装饰器相同，我们的定义与实现是分离的。

下面是定义装饰器方法的部分。

```typescript
// src/decorator/logging.decorator.ts
import { createCustomMethodDecorator } from '@midwayjs/decorator';

// 装饰器内部的唯一 id
export const LOGGING_KEY = 'decorator:logging_key';

export function LoggingTime(): MethodDecorator {
  // 由于这个装饰器没有参数，第二个参数我们就没有传递
  return createCustomMethodDecorator(LOGGING_KEY, {});
}
```



实现的部分，同样需要使用框架内置的 `DecoratorService` 服务。

```typescript
//...

@Configuration({
  imports: [
    koa
  ],
})
export class ContainerConfiguration {

  @App()
  app: koa.Application;
  
  @Inject()
  decoratorService: MidwayDecoratorService;
  
  @Logger()
  logger;

  async onReady() {
    // ...
    
    // 实现方法装饰器
    this.decoratorService.registerMethodHandler(
      LOGGING_KEY,
      (options) => {
        return {
          around: async (joinPoint: JoinPoint) => {
            // 记录开始时间
            const startTime = Date.now();
            
            // 执行原方法
            const result = await joinPoint.proceed(...joinPoint.args);
            
            // 打印执行时间
            this.logger.info(`Method ${joinPoint.methodName} invoke during ${Date.now() - startTime}ms`);
            
            // 返回执行结果
            return result;
          },
        };
      }
    );
  }
}
```

`registerMethodHandler` 方法的第一个参数是装饰器定义的 id，第二个参数是回调的实现，参数为 options 对象，包含：

| 参数                 | 类型          | 描述                   |
| -------------------- | ------------- | ---------------------- |
| options.target       | new (...args) | 装饰器修饰所在的类     |
| options.propertyName | string        | 装饰器修饰所在的方法名 |
| options.metadata     | {}            | 装饰器本身的参数       |

回调的实现，需要返回一个由拦截器处理的方法，key 为拦截器的 `before`，`around`，`afterReturn`，`afterThrow`，`after` 这几个可拦截的生命周期。

由于方法装饰器本身是拦截器实现的，所以具体的拦截方法可以查看 [拦截器](aspect) 部分。

使用装饰器如下：

```typescript
// ...
export class UserService {

  @LoggingTime()
  async getUser() {
  	// ...
  }
}

// 执行时
// output => Method "getUser" invoke during 4ms
```





## 无需实现的方法装饰器

默认情况下，自定义的方法装饰器必须有一个实现，否则运行期会报错。

在某些特殊情况，希望有一个无需实现的装饰器，比如只需要存储元数据而不做拦截。

可以在定义装饰器的时候，增加一个 impl 参数。

```typescript
// src/decorator/logging.decorator.ts
import { createCustomMethodDecorator } from '@midwayjs/decorator';

// 装饰器内部的唯一 id
export const LOGGING_KEY = 'decorator:logging_key';

export function LoggingTime(): MethodDecorator {
  // 最后一个参数告诉框架，无需指定实现
  return createCustomMethodDecorator(LOGGING_KEY, {}, false);
}
```



## 参数装饰器

Midway 提供了 `createCustomParamDecorator` 方法，用于创建自定义参数装饰器。

参数装饰器，一般用于修改参数值，提前预处理数据等，Midway 的 `@Query  `等请求系列的装饰器都基于其实现。



和其他装饰器相同，我们的定义与实现是分离的，我们以获取参数中的用户（ctx.user）来举例。

下面是定义装饰器方法的部分。

```typescript
// src/decorator/logging.decorator.ts
import { createCustomParamDecorator } from '@midwayjs/decorator';

// 装饰器内部的唯一 id
export const USER_KEY = 'decorator:user_key';

export function User(): MethodDecorator {
  return createCustomParamDecorator(USER_KEY, {});
}
```

实现的部分，同样需要使用框架内置的 `DecoratorService` 服务。

```typescript
//...

@Configuration({
  imports: [
    koa
  ],
})
export class ContainerConfiguration {

  @App()
  app: koa.Application;
  
  @Inject()
  decoratorService: MidwayDecoratorService;
  
  @Logger()
  logger;

  async onReady() {
    // ...
    
    // 实现参数装饰器
    this.decoratorService.registerParameterHandler(
      USER_KEY,
      (options) => {
        // originArgs 是原始的方法入参
        // 这里第一个参数是 ctx，所以取 ctx.user
        return options.originArgs[0]?.user ?? {};
      }
    );
  }
}
```

`registerParameterHandler` 方法的第一个参数是装饰器定义的 id，第二个参数是回调的实现，参数为 options 对象，包含：

| 参数                    | 类型          | 描述                   |
| ----------------------- | ------------- | ---------------------- |
| options.target          | new (...args) | 装饰器修饰所在的类     |
| options.propertyName    | string        | 装饰器修饰所在的方法名 |
| options.metadata        | {}            | 装饰器本身的参数       |
| options.originArgs      | Array         | 方法原始的参数         |
| options.originParamType |               | 方法原始的参数类型     |
| options.parameterIndex  | number        | 装饰器修饰的参数索引   |

使用装饰器如下：

```typescript
// ...
export class UserController {

  async invoke(@User() user: string) {
    console.log(user);
    // => xxx
  }
}
```



## 方法装饰器获取上下文

在请求链路上，如果自定义了装饰器要获取上下文往往比较困难，如果代码没有显示的注入上下文，装饰器中获取会非常困难。

在 Midway 的依赖注入的请求作用域中，我们将上下文绑定到了每个实例上，从实例的特定属性 `REQUEST_OBJ_CTX_KEY` 上即可获取当前的上下文，从而进一步对请求做操作。

```typescript
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';

export function MyCustomDecorator(): MethodDecorator {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = function (...args) {
      // 指向当前上层框架的上下文对象，上层框架的上下文对象请参考各上层框架文档。
      console.log(this[REQUEST_OBJ_CTX_KEY]);

      return method.apply(this, [...args]);
    };
    return descriptor;
  };
}
```