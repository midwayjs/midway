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



## 标准 Mock API

Midway 提供了标准的 MidwayMockService 服务，用于在代码中进行模拟数据。

 `@midwayjs/mock` 中的各种模拟方法，底层皆调用了此服务。

API 如下

| API                                          | 返回类型 | 描述                               |
| -------------------------------------------- | -------- | ---------------------------------- |
| mockClassProperty(clzz, propertyName, value) |          | mock 一个class 上的属性（方法 ）   |
| mockProperty(obj, key, value)                |          | mock 一个普通对象上的属性（方法 ） |
| mockContext(app, key, vlue)                  |          | mock 上下文对象上的属性            |
| restore()                                    |          | 清空所有 mock 数据                 |



### mockClassProperty

用于模拟类的某个属性或者方法。

比如某个类。

```typescript
@Provide()
export class UserService {
  data;
  
  async getUser() {
    return 'hello';
  }
}
```

我们也可以在代码中模拟。

```typescript

import { Provide, Inject } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Provide()
class TestMockService {
  @Inject()
  mockService: MidwayMockService;
  
  mock() {
    // 模拟方法
    this.mockService.mockClassProperty(UserService, 'getUser', async () => {
      return 'midway';
    });
    
    // 模拟属性
    this.mockService.mockClassProperty(UserService, 'data', {
      bbb: '1'
    });
  }
}
```



### mockProperty

使用 `mockProperty` 方法来模拟对象的属性。

```typescript
import { Provide, Inject } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Provide()
class TestMockService {
  @Inject()
  mockService: MidwayMockService;
  
  mock() {
    const a = {};
    // 模拟属性
    this.mockService.mockProperty(a, 'name', 'hello');
    // a['name'] => 'hello'
    
    // 模拟方法
    this.mockService.mockProperty(a, 'getUser', async () => {
      return 'midway';
    });
    // await a.getUser() => 'midway'
  }
}

```



### mockContext

由于 Midway 的 Context 和 app 关联，所以在模拟的时候需要传入 app 实例。

使用 `mockContext` 方法来模拟上下文。

```typescript
import { Configuration, App } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Configuration(/**/)
export class AutoConfiguration {
  @Inject()
  mockService: MidwayMockService;
  
  @App()
  app;
  
  async onReady() {
    // 模拟上下文
	  mockContext(app, 'user', 'midway');
  }
}

// ctx.user => midway
```

如果你的数据比较复杂，或者带有逻辑，也可以使用回调形式。

```typescript
import { Configuration, App } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Configuration(/**/)
export class AutoConfiguration {
  @Inject()
  mockService: MidwayMockService;
  
  @App()
  app;
  
  async onReady() {
    // 模拟上下文
	  mockContext(app, (ctx) => {
      ctx.user = 'midway';
    });
  }
}

// ctx.user => midway
```

注意，这个 mock 行为是在所有中间件之前执行。

