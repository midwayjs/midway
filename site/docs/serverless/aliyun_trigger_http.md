---
title: HTTP 触发器
---

阿里云的 HTTP 触发器和其他平台的有所区别，是独立于 API 网关的另一套服务于 HTTP 场景的触发器。相比于 API 网关，该触发器更易于使用和配置。

## 单接口配置

通过直接在代码中的 `@ServerlessTrigger` 装饰器绑定 HTTP 触发器。

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/',
    method: 'get',
  })
  async handleHTTPEvent(@Query() name = 'midway') {
    return `hello ${name}`;
  }
}
```

## 本地测试

和应用类似相同，通过 `createFunctionApp` 创建函数 app，通过 `createHttpRequest` 方式进行测试。

```typescript
import { Framework } from '@midwayjs/serverless-app';
import { createInitializeContext } from '@midwayjs/serverless-fc-trigger';
import { createFunctionApp, createHttpRequest } from '@midwayjs/mock';

describe('test/hello_aliyun.test.ts', () => {
  let app: Application;
  let instance: HelloAliyunService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext(),
    });
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from http trigger', async () => {
    const result = await createHttpRequest(app).get('/').query({
      name: 'zhangting',
    });
    expect(result.text).toEqual('hello zhangting');
  });
});
```

## 部署

使用 `npm run deploy`  部署代码。

发布完成后，平台状态如下。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1586685106514-c52880d4-c447-4bc1-9b8b-6db99dd81878.png#height=436&id=wtVSC&margin=%5Bobject%20Object%5D&name=image.png&originHeight=872&originWidth=2684&originalType=binary&size=164942&status=done&style=none&width=1342" width="1342" />

发布效果，每个配置的函数都将发布成一个平台上的函数，并且自动配置 http 触发器：

## 自定义域名

你需要提前申请一个域名，在国内的话，需要备案，否则无法绑定。

第一步，先将默认自动生成的域名的功能关闭

```yaml
service:
  name: midway-faas-examples

provider:
  name: aliyun

custom:
  customDomain:
    domainName: false ## 5.1 之后，把整段删除也可以
```

第二步，添加域名解析到你函数对应网关。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588654519449-2c98a9d8-ffac-42b7-bcf2-ac19c21f08ac.png#height=478&id=kmxTj&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1090&originWidth=1700&originalType=binary&size=132002&status=done&style=none&width=746" width="746" />

在函数页面绑定自定义域名，添加路由

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588654440214-75bfd1c2-1b6a-4c2b-9c57-198bec9d4e64.png#height=706&id=IEhZC&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1412&originWidth=2794&originalType=binary&size=310772&status=done&style=none&width=1397" width="1397" />

绑定完成后，即可用域名访问。

## 一些限制

Request Headers 不支持以 x-fc-开头的自定义及以下字段的自定义：

- accept-encoding
- connection
- keep-alive
- proxy-authorization
- te
- trailer
- transfer-encoding

Response Headers 不支持以 `x-fc-` 开头的自定义及以下字段的自定义：

- connection
- content-length
- content-encoding
- date
- keep-alive
- proxy-authenticate
- server
- trailer
- transfer-encoding
- upgrade

Request 限制项。如果超过以下限制，会返回 400 状态码和 InvalidArgument 错误码。

- Headers 大小：Headers 中的所有 Key 和 Value 的总大小不得超过 4 KB。
- Path 大小：包括所有的 Query Params，Path 的总大小不得超过 4 KB。
- Body 大小：HTTP Body 的总大小不得超过 6 MB。

Response 限制项。如果超过以下限制，会返回 502 状态码和 BadResponse 错误码。

- Headers 大小：Headers 中的所有 Key 和 Value 的总大小不得超过 4 KB。
