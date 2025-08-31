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

Midway 内部有一套标准的装饰器管理 API，用来将装饰器对接依赖注入容器，实现扫描和扩展，这些 API 方法我们都从 `@midwayjs/core` 包进行导出。

通过装饰器高级 API，我们可以自定义装饰器，并且将元数据附加其中，内部的各种装饰器都是通过该能力实现的。

:::info
从 v4.0 版本开始，Midway 引入了两个新的静态类来管理装饰器和元数据：
- `DecoratorManager` - 管理装饰器模块的注册和查询
- `MetadataManager` - 替代 reflect-metadata，提供完整的元数据管理功能
:::

### DecoratorManager

`DecoratorManager` 是装饰器管理器，负责装饰器模块的注册、查询和自定义装饰器的创建。

**装饰器模块管理**

- `DecoratorManager.saveModule` 用于保存某个类到某个装饰器
- `DecoratorManager.listModule` 获取所有绑定到某类型装饰器的 class
- `DecoratorManager.resetModule` 重置指定装饰器的模块集合
- `DecoratorManager.clearAllModule` 清空所有模块

```typescript
import { DecoratorManager } from '@midwayjs/core';

// 示例：管理 API 接口类
const API_MODULE_KEY = 'api:modules';

// 保存 API 模块
@Controller('/user')
class UserController {}

DecoratorManager.saveModule(API_MODULE_KEY, UserController);

// 获取所有 API 模块
const apiModules = DecoratorManager.listModule(API_MODULE_KEY);
console.log(apiModules); // [UserController]

// 通过过滤器查询
const userModules = DecoratorManager.listModule(API_MODULE_KEY, 
  (module) => module.name.includes('User')
);
```

**Provider 管理工具**

- `DecoratorManager.getProviderUUId` 获取 class provide 出来的 uuid，对应某个类，不会变
- `DecoratorManager.getProviderName` 获取 provide 时保存的 name，一般为类名小写
- `DecoratorManager.getProviderId` 获取 class 上 provide 出来的 id，一般为类名小写，也可能是自定义的 id
- `DecoratorManager.isProvide` 判断某个类是否被 @Provide 修饰过

```typescript
import { DecoratorManager, Provide } from '@midwayjs/core';

@Provide('customUserService')
class UserService {}

// 检查是否为 Provider
console.log(DecoratorManager.isProvide(UserService)); // true

// 获取 Provider 信息
console.log(DecoratorManager.getProviderId(UserService)); // 'customUserService'
console.log(DecoratorManager.getProviderName(UserService)); // 'userService'
console.log(DecoratorManager.getProviderUUId(UserService)); // 唯一UUID字符串

// 保存自定义 Provider ID
DecoratorManager.saveProviderId('myService', UserService);
```

**自定义装饰器创建工具**

- `DecoratorManager.createCustomPropertyDecorator` 创建自定义属性装饰器
- `DecoratorManager.createCustomMethodDecorator` 创建自定义方法装饰器
- `DecoratorManager.createCustomParamDecorator` 创建自定义参数装饰器

```typescript
import { DecoratorManager } from '@midwayjs/core';

// 创建属性装饰器
const Cache = (key: string) => DecoratorManager.createCustomPropertyDecorator('cache', { key });

// 创建方法装饰器
const LogExecution = (level = 'info') => DecoratorManager.createCustomMethodDecorator('log', { level });

// 创建参数装饰器  
const ValidateParam = (rules: any[]) => DecoratorManager.createCustomParamDecorator('validate', { rules });

// 使用装饰器
class UserService {
  @Cache('user-data')
  userData: any;

  @LogExecution('debug')
  async getUser(@ValidateParam(['required', 'string']) id: string) {
    // ...
  }
}
```

### MetadataManager

:::tip
`MetadataManager` 是 v4.0 全新设计的元数据管理器，替代了 reflect-metadata，提供了更高效的缓存机制和原型链元数据继承支持。
:::

**基础元数据操作**

- `MetadataManager.defineMetadata` 定义元数据到 class 或属性（替换现有值）
- `MetadataManager.attachMetadata` 附加元数据到 class 或属性（追加到数组）
- `MetadataManager.getMetadata` 从 class 或属性获取元数据（支持原型链查找）
- `MetadataManager.getOwnMetadata` 从 class 或属性获取自有元数据（不查找原型链）
- `MetadataManager.hasMetadata` 检查 class 或属性是否存在元数据
- `MetadataManager.hasOwnMetadata` 检查 class 或属性是否存在自有元数据
- `MetadataManager.deleteMetadata` 删除 class 或属性的元数据

```typescript
import { MetadataManager } from '@midwayjs/core';

class UserService {
  name: string;
  email: string;
}

// 定义类级别元数据
MetadataManager.defineMetadata('entity', { tableName: 'users' }, UserService);

// 定义属性级别元数据
MetadataManager.defineMetadata('column', { type: 'varchar', length: 100 }, UserService, 'name');
MetadataManager.defineMetadata('column', { type: 'varchar', unique: true }, UserService, 'email');

// 获取元数据
const entityMeta = MetadataManager.getMetadata('entity', UserService);
console.log(entityMeta); // { tableName: 'users' }

const nameMeta = MetadataManager.getMetadata('column', UserService, 'name');
console.log(nameMeta); // { type: 'varchar', length: 100 }

// 检查元数据是否存在
console.log(MetadataManager.hasMetadata('entity', UserService)); // true

// 附加元数据（追加到数组）
MetadataManager.attachMetadata('validations', 'required', UserService, 'name');
MetadataManager.attachMetadata('validations', 'minLength:2', UserService, 'name');

const validations = MetadataManager.getMetadata('validations', UserService, 'name');
console.log(validations); // ['required', 'minLength:2']
```

**元数据复制和批量操作**

- `MetadataManager.copyMetadata` 复制元数据从源类到目标类（包含原型链）
- `MetadataManager.copyOwnMetadata` 复制自有元数据从源类到目标类
- `MetadataManager.getMetadataKeys` 获取 class 或属性的所有元数据键（包含原型链）
- `MetadataManager.getOwnMetadataKeys` 获取 class 或属性的自有元数据键

```typescript
// 元数据复制示例
class BaseEntity {
  id: number;
  createdAt: Date;
}

class UserEntity extends BaseEntity {
  name: string;
}

// 为基础实体设置元数据
MetadataManager.defineMetadata('table', { name: 'base_entities' }, BaseEntity);
MetadataManager.defineMetadata('column', { primary: true }, BaseEntity, 'id');

// 复制元数据到新的类
class ProductEntity {}
MetadataManager.copyMetadata(BaseEntity, ProductEntity);

// 检查复制结果
console.log(MetadataManager.getMetadata('table', ProductEntity)); // { name: 'base_entities' }

// 获取所有元数据键
const keys = MetadataManager.getMetadataKeys(UserEntity);
console.log(keys); // 包含从 BaseEntity 继承的键

// 过滤复制特定元数据
MetadataManager.copyMetadata(BaseEntity, ProductEntity, {
  metadataFilter: (key) => key === 'column', // 只复制 column 元数据
  overwrite: false // 不覆盖已存在的元数据
});
```

**属性元数据查询**

- `MetadataManager.getPropertiesWithMetadata` 获取包含指定元数据的所有属性（支持原型链）
- `MetadataManager.getOwnPropertiesWithMetadata` 获取包含指定元数据的自有属性

```typescript
class UserModel {
  @Column({ type: 'varchar' })
  name: string;
  
  @Column({ type: 'int' })
  age: number;
  
  password: string; // 无装饰器
}

// 假设 @Column 装饰器使用了 'column' 作为元数据键
// 获取所有包含列元数据的属性
const columnsWithMeta = MetadataManager.getPropertiesWithMetadata('column', UserModel);
console.log(columnsWithMeta); 
// { 
//   name: { type: 'varchar' }, 
//   age: { type: 'int' } 
// }

// 只获取自身定义的属性（不包括继承的）
const ownColumns = MetadataManager.getOwnPropertiesWithMetadata('column', UserModel);
```

**类型反射工具**

- `MetadataManager.getMethodParamTypes` 获取某个方法的参数类型
- `MetadataManager.getPropertyType` 获取某个属性的类型
- `MetadataManager.getMethodReturnTypes` 获取方法返回值类型
- `MetadataManager.transformTypeFromTSDesign` 将 TypeScript 设计时类型转换为标准类型描述

```typescript
class ApiService {
  userId: string;
  
  async getUserById(id: string, options?: any): Promise<User> {
    // ...
  }
}

// 获取方法参数类型
const paramTypes = MetadataManager.getMethodParamTypes(ApiService, 'getUserById');
console.log(paramTypes); // [String, Object]

// 获取方法返回类型
const returnType = MetadataManager.getMethodReturnTypes(ApiService, 'getUserById');
console.log(returnType); // Promise

// 获取属性类型
const propertyType = MetadataManager.getPropertyType(ApiService, 'userId');
console.log(propertyType); // String

// 转换类型描述
const typeDesc = MetadataManager.transformTypeFromTSDesign(String);
console.log(typeDesc); // { name: 'string', isBaseType: true, originDesign: String }
```



## 类装饰器

一般类装饰器都会和其他装饰器配合使用，用来标注某个类属于特定的一种场景，比如 `@Controller` 表示了类属于 Http 场景的入口。

我们举一个例子，定义一个类装饰器 @Model ，标识 class 是一个模型类，然后进一步操作。

首先创建一个装饰器文件，比如 `src/decorator/model.decorator.ts` 。

```typescript
import { Scope, ScopeEnum, MetadataManager, DecoratorManager, Provide } from '@midwayjs/core';

// 提供一个唯一 key
export const MODEL_KEY = 'decorator:model';

export function Model(): ClassDecorator {
  return (target: any) => {
    // 将装饰的类，绑定到该装饰器，用于后续能获取到 class
    DecoratorManager.saveModule(MODEL_KEY, target);
    // 保存一些元数据信息，任意你希望存的东西
    MetadataManager.defineMetadata(
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

上面只是定义了这个装饰器，我们还要实现相应的功能，midway v2 开始有生命周期的概念，可以在 `configuration` 中的生命周期中执行。

```typescript
// src/configuration.ts

import { DecoratorManager, Configuration, App, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { MODEL_KEY } from './decorator/model.decorator';

@Configuration({
  imports: [koa],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // ...

    // 可以获取到所有装饰了 @Model() 装饰器的 class
    const modules = DecoratorManager.listModule(MODEL_KEY);
    for (let mod of modules) {
      // 实现自定义能力
      // 比如，拿元数据 MetadataManager.getMetadata(MODEL_KEY, mod)
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

Midway 提供了 `DecoratorManager.createCustomPropertyDecorator` 方法，用于创建自定义属性装饰器，框架的 `@Logger` ，`@Config` 等装饰器都是这样创建而来的。

和 TypeScript 中定义的装饰器不同的是，Midway 提供的属性装饰器，可以在继承中使用。

我们举个例子，假如现在有一个内存缓存，我们的属性装饰器用于获取缓存数据，下面是一些准备工作。

```typescript
// 简单的缓存类
import { Configuration, Provide, Scope, ScopeEnum } from '@midwayjs/core';

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
import { Configuration, App, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa],
})
export class MainConfiguration {
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
import { DecoratorManager } from '@midwayjs/core';

// 装饰器内部的唯一 id
export const MEMORY_CACHE_KEY = 'decorator:memory_cache_key';

export function MemoryCache(key?: string): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(MEMORY_CACHE_KEY, {
    key,
  });
}
```

在装饰器的方法执行之前（一般在初始化的地方）去实现。实现装饰器，我们需要用到内置的 `MidwayDecoratorService` 服务。

```typescript
import { Configuration, Inject, Init, MidwayDecoratorService } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { MEMORY_CACHE_KEY, MemoryStore } from 'decorator/memoryCache.decorator';

@Configuration({
  imports: [koa],
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

    // 实现装饰器
    this.decoratorService.registerPropertyHandler(MEMORY_CACHE_KEY, (propertyName, meta) => {
      return this.store.get(meta.key);
    });
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

Midway 提供了 `DecoratorManager.createCustomMethodDecorator` 方法，用于创建自定义方法装饰器。

和 TypeScript 中定义的装饰器不同的是，Midway 提供的方法装饰器，由拦截器统一实现，和其他拦截方式不冲突，并且更加简单。

我们以打印方法执行时间为例。

和属性装饰器相同，我们的定义与实现是分离的。

下面是定义装饰器方法的部分。

```typescript
// src/decorator/logging.decorator.ts
import { DecoratorManager } from '@midwayjs/core';

// 装饰器内部的唯一 id
export const LOGGING_KEY = 'decorator:logging_key';

export function LoggingTime(formatUnit = 'ms'): MethodDecorator {
  // 我们传递了一个可以修改展示格式的参数
  return DecoratorManager.createCustomMethodDecorator(LOGGING_KEY, { formatUnit });
}
```

实现的部分，同样需要使用框架内置的 `DecoratorService` 服务。

```typescript
//...

function formatDuring(value, formatUnit: string) {
  // 这里返回时间格式化
  if (formatUnit === 'ms') {
    return `${value} ms`;
  } else if (formatUnit === 'min') {
    // return xxx
  }
}

@Configuration({
  imports: [koa],
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

    // 实现方法装饰器
    this.decoratorService.registerMethodHandler(LOGGING_KEY, (options) => {
      return {
        around: async (joinPoint: JoinPoint) => {
          // 拿到格式化参数
          const format = options.metadata.formatUnit || 'ms';

          // 记录开始时间
          const startTime = Date.now();

          // 执行原方法
          const result = await joinPoint.proceed(...joinPoint.args);

          const during = formatDuring(Date.now() - startTime, format);

          // 打印执行时间
          this.logger.info(`Method ${joinPoint.methodName} invoke during ${during}`);

          // 返回执行结果
          return result;
        },
      };
    });
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

:::caution

注意，被装饰的方法必须为 async 方法。

:::



## 无需实现的方法装饰器

默认情况下，自定义的方法装饰器必须有一个实现，否则运行期会报错。

在某些特殊情况，希望有一个无需实现的装饰器，比如只需要存储元数据而不做拦截。

可以在定义装饰器的时候，增加一个 impl 参数。

```typescript
// src/decorator/logging.decorator.ts
import { DecoratorManager } from '@midwayjs/core';

// 装饰器内部的唯一 id
export const LOGGING_KEY = 'decorator:logging_key';

export function LoggingTime(): MethodDecorator {
  // 最后一个参数告诉框架，无需指定实现
  return DecoratorManager.createCustomMethodDecorator(LOGGING_KEY, {}, false);
}
```

## 参数装饰器

Midway 提供了 `DecoratorManager.createCustomParamDecorator` 方法，用于创建自定义参数装饰器。

参数装饰器，一般用于修改参数值，提前预处理数据等，Midway 的 `@Query` 等请求系列的装饰器都基于其实现。

和其他装饰器相同，我们的定义与实现是分离的，我们以获取参数中的用户（ctx.user）来举例。

下面是定义装饰器方法的部分。

```typescript
// src/decorator/logging.decorator.ts
import { DecoratorManager } from '@midwayjs/core';

// 装饰器内部的唯一 id
export const USER_KEY = 'decorator:user_key';

export function User(): ParameterDecorator {
  return DecoratorManager.createCustomParamDecorator(USER_KEY, {});
}
```

实现的部分，同样需要使用框架内置的 `DecoratorService` 服务。

```typescript
//...

@Configuration({
  imports: [koa],
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

    // 实现参数装饰器
    this.decoratorService.registerParameterHandler(USER_KEY, (options) => {
      // originArgs 是原始的方法入参
      // 这里第一个参数是 ctx，所以取 ctx.user
      return options.originArgs[0]?.user ?? {};
    });
  }
}
```

`registerParameterHandler` 方法的第一个参数是装饰器定义的 id，第二个参数是回调的实现，参数为 options 对象，包含：

| 参数                    | 类型            | 描述                   |
| ----------------------- | --------------- | ---------------------- |
| options.target          | new (...args)   | 装饰器修饰所在的类     |
| options.propertyName    | string          | 装饰器修饰所在的方法名 |
| options.metadata        | {} \| undefined | 装饰器本身的参数       |
| options.originArgs      | Array           | 方法原始的参数         |
| options.originParamType |                 | 方法原始的参数类型     |
| options.parameterIndex  | number          | 装饰器修饰的参数索引   |

使用装饰器如下：

```typescript
// ...
export class UserController {

  @Inject()
  userService: UserService;

  @Inject()
  ctx: Context;

  async getUser() {
    return await this.getUser(ctx);
  }
}

export class UserService {
  async getUser(@User() user: string) {
    console.log(user);
    // => xxx
  }
}
```


:::tip

注意，为了方法调用的正确性，如果参数装饰器中报错，框架会使用原始的参数来调用方法，不会直接抛出异常。

你可以在开启 `NODE_DEBUG=midway:debug` 环境变量时找到这个错误。

:::

:::caution

注意，被装饰的方法必须为 async 方法。

:::



## 方法装饰器获取上下文

在请求链路上，如果自定义了装饰器要获取上下文往往比较困难，如果代码没有显式的注入上下文，装饰器中获取会非常困难。

在 Midway 的依赖注入的请求作用域中，我们将上下文绑定到了每个实例上，从实例的特定属性 `REQUEST_OBJ_CTX_KEY` 上即可获取当前的上下文，从而进一步对请求做操作。

比如在我们自定义实现的方法装饰器中：

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

    // 实现方法装饰器
    this.decoratorService.registerMethodHandler(LOGGING_KEY, (options) => {
      return {
        around: async (joinPoint: JoinPoint) => {
          // 装饰器所在的实例
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

