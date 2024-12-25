# 生命周期

在通常情况下，我们希望在应用启动的时候做一些初始化、或者其他一些预处理的事情，比如创建数据库连接、预生成一些配置，而不是在请求响应时去处理。



## 项目生命周期

框架提供了这些生命周期函数供开发人员处理：

- 配置文件加载，我们可以在这里去修改配置（`onConfigLoad`）
- 依赖注入容器准备完毕，可以在这个阶段做大部分的事情（`onReady`）
- 服务启动完成，可以拿到 server（`onServerReady`）
- 应用即将关闭，在这里清理资源（`onStop`）


Midway 的生命周期是通过 `src/configuration.ts` 文件，实现 ILifeCycle 接口，就可以在项目启动时候自动加载。


接口定义如下。


```typescript
interface ILifeCycle {
  /**
  * 在应用配置加载后执行
  */
  onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;

  /**
   * 在依赖注入容器 ready 的时候执行
   */
  onReady(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;

  /**
   * 在应用服务启动后执行
   */
  onServerReady?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;

  /**
   * 在应用停止的时候执行
   */
  onStop?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;

  /**
   * 在健康检查时执行
   */
  onHealthCheck?(container: IMidwayContainer): Promise<HealthResult>;
}
```



### onConfigLoad

一般用于修改项目的配置文件。

举个例子。

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onConfigLoad(): Promise<void> {
    // 直接返回数据，会自动合并到配置中
    return {
      test: 1
    }
  }
}
```

这个时候，`@Config` 拿到的配置就包含了返回的数据，具体可以参考 [异步初始化配置](./env_config#异步初始化配置) 章节。



### onReady

onReady 是一个大部分场景下都会使用到的生命周期。

:::info
注意，这里的 ready 指的是依赖注入容器 ready，并不是应用 ready，所以你可以对应用做任意扩展，比如添加中间件，连接数据库等等。
:::


我们需要在初始化时提前连接一个数据库，由于在类中，所以也可以通过 `@Inject`  装饰器注入 db 这样一个数据库的连接工具类，这个实例包含 connect 和 close 两个函数：


```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {
  @Inject()
  db: any;

  async onReady(container: IMidwayContainer): Promise<void> {
    // 建立数据库连接
    await this.db.connect();
  }

  async onStop(): Promise<void> {
	// 关闭数据库连接
    await this.db.close();
  }
}
```


这样，我们就能够在应用启动时建立数据库连接，而不是在请求响应时再去创建。同时，在应用停止时，也可以优雅的关闭数据库连接。


除此之外，通过这个方式，可以对默认注入的对象做扩充。


```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import * as sequelize from 'sequelize';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onReady(container: IMidwayContainer): Promise<void> {
    // 三方包对象
    container.registerObject('sequelize', sequelize);
  }
}
```


在其他的类中可以直接注入使用。


```typescript
export class IndexHandler {

  @Inject()
  sequelize;

  async handler() {
  	console.log(this.sequelize);
  }
}
```



### onServerReady

当要获取框架的服务对象，端口等信息时，就需要用到这个生命周期。

我们以 `@midwayjs/koa` 为例，在启动时获取它的 Server。

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa]
})
export class MainConfiguration implements ILifeCycle {

  async onServerReady(container: IMidwayContainer): Promise<void> {
    // 获取到 koa 中暴露的 Framework
    const framework = await container.getAsync(koa.Framework);
    const server = framework.getServer();
    // ...

  }
}
```



### onStop

我们可以在这个阶段清理一些资源，比如关闭连接等。

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [koa]
})
export class MainConfiguration implements ILifeCycle {
  @Inject()
  db: any;

  async onReady(container: IMidwayContainer): Promise<void> {
    // 建立数据库连接
    await this.db.connect();
  }

  async onStop(): Promise<void> {
    // 关闭数据库连接
    await this.db.close();
  }
}
```



### onHealthCheck

当内置的健康检查服务调用状态获取 API 时，所有组件的该方法都被自动执行。

下面模拟了一个 db 健康检查的方法。

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer, HealthResult } from '@midwayjs/core';

@Configuration({
  namespace: 'db'
})
export class MainConfiguration implements ILifeCycle {
  @Inject()
  db: any;

  async onReady(container: IMidwayContainer): Promise<void> {
    await this.db.connect();
  }

  async onHealthCheck(): Promise<HealthResult> {
    try {
      const result = await this.db.isConnect();
      if (result) {
        return {
          status: true,
        };
      } else {
        return {
          status: false,
          reason: 'db is disconnect',
        };
      }
    } catch (err) {
      return {
        status: false,
        reason: err.message,
      };
    }
  }
}
```

上述 `onHealthCheck` 中，调用了一个 `isConnect` 的状态检查，根据结果返回了固定的 `HealthResult` 类型格式。

注意，外部调用 `onHealthCheck` 可能会非常频繁，请尽可能保持检查逻辑的可靠性和效率，确保不会对检查依赖有较大的压力。同时请自行处理检查超时后资源释放的逻辑，避免资源频繁请求却未返回结果，导致内存泄露的风险。



## 全局对象生命周期

所谓对象生命周期，指的是每个对象，在依赖注入容器中创建，销毁的事件。我们通过这些生命周期，可以在对象创建后，销毁时做一些操作。

```typescript
export interface IObjectLifeCycle {
  onBeforeObjectCreated(/**...**/);
  onObjectCreated(/**...**/);
  onObjectInit(/**...**/);
  onBeforeObjectDestroy(/**...**/);
}
```

`ILifeCycle` 定义中已经包含了这些阶段。

:::caution

注意，对象生命周期 API 会影响整个依赖注入容器以及业务的使用，请谨慎操作。

:::

### onBeforeObjectCreated

在业务对象实例创建前执行，框架内部的某些对象由于已经初始化，无法被拦截。

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer, ObjectBeforeCreatedOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onBeforeObjectCreated(Clzz: new (...args), options: ObjectBeforeCreatedOptions): Promise<void> {
    // ...
  }
}
```

这里入参有两个参数：

- `Clzz` 当前待创建对象的原型类
- `options` 一些参数

参数如下:

| 属性                    | 类型              | 描述             |
| ----------------------- | ----------------- | ---------------- |
| options.context         | IMidwayContainer  | 依赖注入容器本身 |
| options.definition      | IObjectDefinition | 对象定义         |
| options.constructorArgs | any[]             | 构造器入参       |



### onObjectCreated

在对象实例创建后执行，这个阶段可以替换创建的对象。

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer, ObjectCreatedOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onObjectCreated(ins: any, options: ObjectCreatedOptions): Promise<void> {
    // ...
  }
}
```

这里入参有两个参数：

- `ins` 当前通过构建器创出来的对象
- `options` 一些参数

参数如下:

| 属性                    | 类型               | 描述               |
| ----------------------- | ------------------ | ------------------ |
| options.context         | IMidwayContainer   | 依赖注入容器本身   |
| options.definition      | IObjectDefinition  | 对象定义           |
| options.replaceCallback | (ins: any) => void | 对象替换的回调方法 |

**示例：动态添加属性**

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer, ObjectInitOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onObjectCreated(ins: any, options: ObjectInitOptions): Promise<void> {
    // 每个创建的对象都会添加一个 _name 的属性
    ins._name = 'xxxx';
    // ...
  }
}
```

**示例：替换对象**

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer, ObjectInitOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onObjectCreated(ins: any, options: ObjectInitOptions): Promise<void> {
    // 之后每个创建的对象都会被替换为 { bbb: 'aaa' }
    options.replaceCallback({
      bbb: 'aaa'
    });

    // ...
  }
}
```



### onObjectInit

在对象实例创建后执行异步初始化方法后执行。

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer, ObjectInitOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onObjectInit(ins: any, options: ObjectInitOptions): Promise<void> {
    // ...
  }
}
```

这里入参有两个参数：

- `ins` 当前通过构建器创出来的对象
- `options` 一些参数

参数如下:

| 属性               | 类型              | 描述             |
| ------------------ | ----------------- | ---------------- |
| options.context    | IMidwayContainer  | 依赖注入容器本身 |
| options.definition | IObjectDefinition | 对象定义         |

:::info

在这个阶段也可以动态给对象附加属性，方法等，和 `onObjectCreated` 的区别是，这个阶段是在初始化方法执行之后。

:::



### onBeforeObjectDestroy

在对象实例销毁前执行。

```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, IMidwayContainer, ObjectBeforeDestroyOptions } from '@midwayjs/core';

@Configuration()
export class MainConfiguration implements ILifeCycle {

  async onBeforeObjectDestroy(ins: any, options: ObjectBeforeDestroyOptions): Promise<void> {
    // ...
  }
}
```

这里入参有两个参数：

- `ins` 当前通过构建器创出来的对象
- `options` 一些参数

参数如下:

| 属性               | 类型              | 描述             |
| ------------------ | ----------------- | ---------------- |
| options.context    | IMidwayContainer  | 依赖注入容器本身 |
| options.definition | IObjectDefinition | 对象定义         |

