# Timer trigger (timed task)

A timed task trigger is used to periodically execute a function. Tencent Cloud Timer Trigger currently only supports cron format.

:::info
Warm reminder, please close the trigger in time after testing the function and execute it automatically to avoid over-deduction.
:::

## Usage

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, SCF } from '@midwayjs/faas';

@Provide()
export class HelloTencentService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'cron',
    value: '*/60 * * * * * *', // trigger every 60s
  })
  async handleTimerEvent(event: SCF.TimerEvent) {
    this.ctx.logger.info(event);
    return 'hello world';
  }
}
```

Note that Tencent Cloud is set to full Cron. For more information about the Cron format, see [Development documentation](https://cloud.tencent.com/document/product/583/9708).

Common format:

```
*/5 * * * * * indicates that it is triggered every 5 seconds.
0 0 2 1 * * * indicates that it is triggered at 2: 00 a.m. on the 1st of each month.
0 15 10 * * MON-FRI * means it will be triggered at 10:15 a.m. every day from Monday to Friday.
0 0 10,14,16 * * * * means to trigger at 10: 00 a.m., 2: 00 p.m. and 4: 00 p.m. every day
0 */30 9-17 * * * * means every half hour from 9: 00 a.m. to 5: 00 p.m.
0 0 12 * * WED * means to trigger at 12 noon every Wednesday
```

Run `npm run deploy`.

## Timer configuration

| Attribute name | Type | Description |
| ------- | ------ | ---------------------------------- |
| type | cron | Required, trigger type, representing cron expression.  |
| value | string | Required, cron expression or every value.  |
| payload | string | Optional, a fixed passed value, rarely used |
|         |        |                                    |

Example:

**cron expression**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'cron',
  value: '0 0 4 * * *', //triggered at 4:00 every day
})
```

## Event structure

The structure returned by the Timer message is as follows and is described in the `SCF.TimerEvent` type.

```json
{
  Message: '',
  Time: new Date().toJSON()
  TriggerName: 'test',
  Type: 'Timer',
}
```

## Local development

You cannot use dev to develop events locally. You can only run the `npm run test` command to run tests.

## Local test

Unlike HTTP testing, the function app is created by `createFunctionApp`, and the instance of the entire class is obtained by `getServerlessInstance`, thus calling a specific method to test.

You can quickly create the structure passed in by the platform by `createTimerEvent` methods.

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

