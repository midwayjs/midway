---
title: midway 高级测试方案
---

### 测试应用

普通场景下，从 Controller 开始测试，这个时候需要启动整个应用来测试路由。

```typescript
import { app, assert } from 'midway-mock/bootstrap';
describe('test/controller/home.test.ts', () => {
  it('should GET /', () => {
    // 对 app 发起 `GET /` 请求
    return app
      .httpRequest()
      .get('/')
      .expect('Welcome to midwayjs!') // 期望 body 是 hello world
      .expect(200); // 期望返回 status 200
  });
});
```

### 测试 Service

如果单独测试 Service，分两种情况。

**1、测试单例（无 ctx 关联）**
\*\*
直接从 app 上挂载的 `applicationContext`  属性中获取 Service 实例，进而调用方法。

```typescript
import { app, assert } from 'midway-mock/bootstrap';
import { IUserService } from '../../src/interface';

describe('test/service/user.test.ts', () => {
  it('#getUser', async () => {
    // 取出 userService
    const user = await app.applicationContext.getAsync<IUserService>('userService');
    const data = await user.getUser({ id: 1 });
    assert(data.id === 1);
    assert(data.username === 'mockedName');
  });
});
```

**2、测试请求作用域（带有 ctx）**

一般场景下，Service 中可能含有 `@inject() ctx`  的代码，会有从 ctx 取东西，这样的 Service 必须和一个请求相关联，而在 egg 体系中，必须先创建一个匿名上下文才行。

```typescript
import { app, assert } from 'midway-mock/bootstrap';
import { IUserService } from '../../src/interface';

describe('test/service/user.test.ts', () => {
  it('#getUser', async () => {
    // 创建匿名上下文
    const ctx = app.mockContext();
    // 取出 userService
    const user = await ctx.requestContext.getAsync<IUserService>('userService');
    const data = await user.getUser({ id: 1 });
    assert(data.id === 1);
    assert(data.username === 'mockedName');
  });
});
```

**3、覆盖某些服务的方法**
\*\*
如果想在测试时覆盖某些方法的返回值，可以通过 `app.mockClassFunction`  的方式来进行。

```typescript
import { app, assert } from 'midway-mock/bootstrap';
import { IUserService } from '../../src/interface';

// service，放在文件中
@provide('userService')
export class UserService {
  async getUser() {
    return 'zhang';
  }
}

describe('test/service/user.test.ts', () => {
  it('#getUser', async () => {
    app.mockClassFunction('userService', 'getUser', () => {
      return 'chen';
    });
    // 取出 userService
    const user = await app.applicationContext.getAsync<IUserService>('userService');
    const data = await user.getUser(); // chen
  });
});
```

**4、使用 IoC 某些服务的方法**

有时候，会有覆盖某些 Service 的特定属性，模拟返回值的需求。利用 IoC 的特性，我们可以做一个假的服务去替换原本的那个，只要**保持 id 相等**。

:::info
我们把真的服务放在 src 中，假的放在 test 目录中，这样对线上服务就不会有影响。
:::

```typescript
// 真正的 service，放在 service/user.ts
@provide('userService')
export class UserService {
  async getUser() {
    return 'zhang';
  }
}

// 假的服务，我们放在 test/service/user.ts 中
// 继承可以方便的只做特定逻辑的覆盖
// 保持 @provide 出原本的 id
@provide('userService')
export class MockUserService extends UserService {
  async getUser() {
    return 'chen';
  }
}
```

测试代码

```typescript
import { mm, assert } from 'midway-mock';
import { IUserService } from '../../src/interface';
import { MockUserService } from '../service/user';

describe('test/service/user.test.ts', () => {
  it('#getUser', async () => {
    const app = mm.app();
    await app.ready();

    // 用同样的 id 替换真的 service，后续逻辑和其他测试相同
    app.applicationContext.bindClass(MockUserService);

    // 创建匿名上下文
    const ctx = app.mockContext();
    // 取出 userService
    const user = await ctx.requestContext.getAsync<IUserService>('userService');
    const data = await user.getUser({ id: 1 });
    assert(data.id === 1);
    assert(data.username === 'mockedName');
  });
});
```
