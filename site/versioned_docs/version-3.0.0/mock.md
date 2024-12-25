# 数据模拟

Midway 提供了内置的在开发和测试时模拟数据的能力。



## 测试时 Mock

`@midwayjs/mock` 提供了一些更为通用的 API，用于在测试时进行模拟。

### 模拟上下文

使用 `mockContext` 方法来模拟上下文。

```typescript
import { mockContext } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  // 模拟上下文
  mockContext(app, 'user', 'midway');

  const result1 = await createHttpRequest(app).get('/');
  // ctx.user => midway
  // ...
});
```

如果你的数据比较复杂，或者带有逻辑，也可以使用回调形式。

```typescript
import { mockContext } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  const app = await createApp();

  // 模拟上下文
  mockContext(app, (ctx) => {
    ctx.user = 'midway';
  });
});
```

注意，这个 mock 行为是在所有中间件之前执行。



### 模拟 Session

使用 `mockSession` 方法来模拟 Session。

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

### 模拟 Header

使用 `mockHeader` 方法来模拟 Header。

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

### 模拟类属性

使用 `mockClassProperty` 方法来模拟类的属性。

假如有下面的服务类。

```typescript
@Provide()
export class UserService {
  data;

  async getUser() {
    return 'hello';
  }
}
```

我们可以在使用时进行模拟。

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

也可以模拟方法。

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



### 模拟普通对象属性

使用 `mockProperty` 方法来模拟对象的属性。

```typescript
import { mockProperty } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {

  const a = {};
  mockProperty(a, 'name', 'hello');

  // a['name'] => 'hello'

  // ...
});
```

也可以模拟方法。

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

### 分组

从 `3.19.0` 开始，Midway 的 mock 功能支持通过分组来管理不同的 mock 数据。你可以在创建 mock 时指定一个分组名称，这样可以在需要时单独恢复或清理某个分组的 mock 数据。


```typescript
import { mockContext, restoreMocks } from '@midwayjs/mock';

it('should test mock with groups', async () => {
  const app = await createApp();

  // 创建普通对象的 mock
  const a = {};
  mockProperty(a, 'getUser', async () => {
    return 'midway';
  }, 'group1');

  // 创建上下文的 mock
  mockContext(app, 'user', 'midway', 'group1');
  mockContext(app, 'role', 'admin', 'group2');

  // 恢复单个分组
  restoreMocks('group1');

  // 恢复所有分组
  restoreAllMocks();
});
```

通过分组，你可以更灵活地管理和控制 mock 数据，特别是在复杂的测试场景中。



### 清理 mock

在每次调用 `close` 方法时，会自动清理所有的 mock 数据。

如果希望手动清理，也可以执行方法 `restoreAllMocks` 。

```typescript
import { restoreAllMocks } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  restoreAllMocks();
  // ...
});
```

从 `3.19.0` 开始，支持指定 group 清理。

```typescript
import { restoreMocks } from '@midwayjs/mock';

it('should test create koa app with new mode with mock', async () => {
  restoreMocks('group1');();
  // ...
});
```


## 标准 Mock 服务

Midway 提供了标准的 MidwayMockService 服务，用于在代码中进行模拟数据。

 `@midwayjs/mock` 中的各种模拟方法，底层皆调用了此服务。

具体 API 请参考 [内置服务](./built_in_service#midwaymockservice)



## 开发期 Mock

每当后端服务没有上线，或者在开发阶段未准备好数据的时候，就需要用到开发期模拟的能力。



### 编写模拟类

一般情况下，我们会在 `src/mock` 文件夹中编写开发期使用的模拟数据，我们的模拟行为实际是一段逻辑代码。

:::tip

不要对模拟数据放在代码中不习惯，事实上它是逻辑的一部分。

:::

我们举个例子，假如现在有一个获取 Index 数据的服务，但是服务还未开发完毕，我们只能编写模拟代码。

```typescript
// src/service/indexData.service.ts
import { Singleton, makeHttpRequest, Singleton } from '@midwayjs/core';

@Singleton()
export class IndexDataService {
  
  @Config('index')
  indexConfig: {indexUrl: string};

  private indexData;

  async load() {
    // 从远端获取数据
    this.indexData = await this.fetchIndex(this.indexConfig.indexUrl);
  }
  
  public getData() {
    if (!this.indexData) {
      // 数据不存在，就加载一次
      this.load();
    }
    return this.indexData;
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

上面的代码，故意抽离了 `fetchIndex` 方法，用来方便后续的模拟行为。

:::

当接口未开发完毕的时候，我们本地开发就很困难，常见的做法是定义一份 JSON 数据，

比如，创建一个 `src/mock/indexData.mock.ts` ，用于初始化的服务接口模拟。

```typescript
// src/mock/indexData.mock.ts
import { Mock, ISimulation } from '@midwayjs/core';

@Mock()
export class IndexDataMock implements ISimulation {
}
```

`@Mock` 用于代表它是一个模拟类，用于模拟一些业务行为，`ISimulation` 是需要业务实现的一些接口。

比如，我们要模拟接口的数据。

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
    // 使用 MidwayMockService API 模拟属性
    this.mockService.mockClassProperty(IndexDataService, 'fetchIndex', async (url) => {
      // 根据逻辑返回不同的数据
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
    // 模拟类启用的条件
    return ['local', 'test', 'unittest'].includes(this.app.getEnv());
  }
}
```

上面的代码中，`enableCondition` 是必须实现的方法，代表当前模拟类的启用条件，比如上面的代码仅在 `local` ，`test` 和 `unittest` 环境下生效。



### 模拟时机

模拟类包含一些模拟的时机，都已经定义在 `ISimulation` 接口中，比如：

```typescript
export interface ISimulation {
  /**
   * 最开始的模拟时机，在生命周期 onConfigLoad 之后执行
   */
  setup?(): Promise<void>;
  /**
   * 在生命周期关闭时执行，一般用于数据清理
   */
  tearDown?(): Promise<void>;
  /**
   * 在每种框架初始化时执行，会传递当前框架的 app
   */
  appSetup?(app: IMidwayApplication): Promise<void>;
  /**
   * 在每种框架的请求开始时执行，会传递当前框架的 app 和 ctx
   */
  contextSetup?(ctx: IMidwayContext, app: IMidwayApplication): Promise<void>;
  /**
   * 每种框架的请求结束时执行，在错误处理之后
   */
  contextTearDown?(ctx: IMidwayContext, app: IMidwayApplication): Promise<void>;
  /**
   * 每种框架的停止时执行
   */
  appTearDown?(app: IMidwayApplication): Promise<void>;
  /**
   * 模拟的执行条件，一般是特定环境，或者特定框架下
   */
  enableCondition(): boolean | Promise<boolean>;
}
```

基于上面的接口，我们实现非常自由的模拟逻辑。

比如，在不同的框架上添加不同的中间件。

```typescript
import { App, IMidwayApplication, Mock, ISimulation } from '@midwayjs/core';

@Mock()
export class InitDataMock implements ISimulation {

  @App()
  app: IMidwayApplication;

  async appSetup(app: IMidwayApplication): Promise<void> {
    // 针对不同的框架类型，添加不同的测试中间件
    if (app.getNamespace() === 'koa') {
      app.useMiddleware(/*...*/);
      app.useFilter(/*...*/);
    }
    
    if (app.getNamespace() === 'bull') {
      app.useMiddleware(/*...*/);
      app.useFilter(/*...*/);
    }
  }

  enableCondition(): boolean | Promise<boolean> {
    return ['local', 'test', 'unittest'].includes(this.app.getEnv());
  }
}
```


