---
title: Timer 触发器（定时任务）
---

定时任务触发器用于定时执行一个函数。定时有两种方式，时间间隔（every）和 cron 格式。

:::info
温馨提醒，测试函数后请及时关闭触发器自动执行，避免超额扣费。
:::

## 使用方式

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, FC } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'cron',
    value: '0 0 4 * * *', // 每天4:00触发  https://help.aliyun.com/document_detail/68172.html
  })
  async handleTimerEvent(event: FC.TimerEvent) {
    this.ctx.logger.info(event);
    return 'hello world';
  }
}
```

在 `npm run deploy` 后，即可。

## Timer 配置

| 属性名  | 类型   | 描述                                                                      |
| ------- | ------ | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| type    | 'cron' | 'every'                                                                   | 必填，触发类型，分别代表 cron 表达式，固定时间间隔。 |
| value   | string | 必填，cron 表达式或者 every 值。every 时最小时间间隔 1 分钟，固定单位分钟 |
| payload | string | 可选，一个固定传递的值，很少用                                            |
|         |        |                                                                           |

:::info
注意，FC 使用的是 UTC 时间，和传统的中国时区不同。
:::

示例：

**cron 表达式**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'cron',
  value: '0 0 4 * * *', // 每天4:00触发
})
```

cron 表达式可以查看 [文档](https://help.aliyun.com/document_detail/169784.html)。

**every 表达式**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'every',
  value: '5m', // 每隔 5 分钟，最小为 1 分钟
})
```

## 事件结构

Timer 消息返回的结构如下，在 `FC.TimerEvent` 类型中有描述。

```json
{
  triggerTime: new Date().toJSON(),
  triggerName: 'timer',
  payload: '',
}
```

## 本地开发

事件类型的函数本地无法使用 dev 开发，只能通过运行 `npm run test` 进行测试执行。

## 本地测试

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `createTimerEvent` 方法快速创建平台传入的结构。

```typescript
import { createFunctionApp, close } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { createTimerEvent, createInitializeContext } from '@midwayjs/serverless-fc-trigger';
import { join } from 'path';

describe('test/hello_aliyun.test.ts', () => {
  let app: Application;
  let instance: HelloAliyunService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext(),
    });
    instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from timer trigger', async () => {
    expect(await instance.handleTimerEvent(createTimerEvent())).toEqual('hello world');
  });
});
```

## 关闭触发器

如果不再使用，请务必关闭触发器或者直接删除。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618734441838-7a943f47-bbf7-4398-b63e-4b249f83d711.png#clientId=u77edf6bf-5564-4&from=paste&height=405&id=u9e6b7d20&margin=%5Bobject%20Object%5D&originHeight=810&originWidth=2280&originalType=binary&ratio=1&size=134297&status=done&style=none&taskId=u261c1c9a-06a0-4664-9a2b-4f0188cd9b8&width=1140" width="1140" />
