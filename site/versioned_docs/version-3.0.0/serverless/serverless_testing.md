# 测试函数

## HTTP 类的函数

该方法适用于所有的类 HTTP 触发器的函数，包括 `HTTP` 和 `API_GATEWAY`。

使用和应用相同的测试方法来测试，针对 HTTP 函数，使用封装了 supertest 的 `createHttpRequest` 方法创建 HTTP 客户端。

唯一和应用不同的是，使用 `createFunctionApp` 方法创建函数应用（app）。

`createFunctionApp` 是 `createApp` 在函数场景下的定制方法。

HTTP 测试代码如下：

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/faas';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from api gateway trigger', async () => {
    
    const app: Application = await createFunctionApp<Framework>();
    
    const result = await createHttpRequest(app).get('/').query({
      name: 'zhangting',
    });
    expect(result.text).toEqual('hello zhangting');
    
    await close(app);

  });
});
```



## 普通触发器

除了类 HTTP 触发器之外，我们还有其他比如定时器、对象存储等函数触发器，这些触发器由于和网关关系密切，不能使用 HTTP 行为来测试，而是使用传统的方法调用来做。

通过 `createFunctionApp` 方法创建函数 app，通过 `getServerlessInstance` 方法获取类实例，然后通过实例的方法直接调用，传入参数进行测试。

```typescript
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/faas';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from event trigger', async () => {
    // 创建函数 app
    let app: Application = await createFunctionApp<Framework>();
    
    // 拿到服务类
    const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
    
    // 调用函数方法，传入参数
    expect(await instance.handleEvent('hello world')).toEqual('hello world');
    
    await close(app);
  });
});
```

