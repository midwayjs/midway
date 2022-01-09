---
title: Timer 触发器（定时任务）
---

定时任务触发器用于定时执行一个函数。腾讯云 Timer 触发器目前只支持 cron 格式。

:::info
温馨提醒，测试函数后请及时关闭触发器自动执行，避免超额扣费。
:::

## 使用方式

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, SCF } from '@midwayjs/faas';

@Provide()
export class HelloTencentService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'cron',
    value: '*/60 * * * * * *', // 每 60s 触发
  })
  async handleTimerEvent(event: SCF.TimerEvent) {
    this.ctx.logger.info(event);
    return 'hello world';
  }
}
```

注意，腾讯云的定时为全 Cron，具体 Cron 格式请参考 [开发文档](https://cloud.tencent.com/document/product/583/9708)。

常用格式：

```
*/5 * * * * * * 表示每5秒触发一次
0 0 2 1 * * * 表示在每月的1日的凌晨2点触发
0 15 10 * * MON-FRI * 表示在周一到周五每天上午10：15触发
0 0 10,14,16 * * * * 表示在每天上午10点，下午2点，4点触发
0 */30 9-17 * * * * 表示在每天上午9点到下午5点每半小时触发
0 0 12 * * WED * 表示在每个星期三中午12点触发
```

执行 `npm run deploy` 部署即可。

## Timer 配置

| 属性名  | 类型   | 描述                               |
| ------- | ------ | ---------------------------------- |
| type    | cron   | 必填，触发类型，代表 cron 表达式。 |
| value   | string | 必填，cron 表达式或者 every 值。   |
| payload | string | 可选，一个固定传递的值，很少用     |
|         |        |                                    |

示例：

**cron 表达式**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'cron',
  value: '0 0 4 * * *', // 每天4:00触发
})
```

## 事件结构

Timer 消息返回的结构如下，在 `SCF.TimerEvent` 类型中有描述。

```json
{
  Message: '',
  Time: new Date().toJSON(),
  TriggerName: 'test',
  Type: 'Timer',
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
import { HelloTencentService } from '../src/function/hello_tencent';
import { createTimerEvent } from '@midwayjs/serverless-scf-trigger';
import { join } from 'path';

describe('test/hello_tencent.test.ts', () => {
  let app: Application;
  let instance: HelloTencentService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>();
    instance = await app.getServerlessInstance<HelloTencentService>(HelloTencentService);
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from timer trigger', async () => {
    expect(await instance.handleTimerEvent(createTimerEvent())).toEqual('hello world');
  });
});
```

##
