# 本地任务

和 bull 组件不同，cron 组件提供的是本地任务能力，即在每台机器的每个进程都会执行。如需不同机器或者不同进程之间只执行一次任务，请使用 [bull 组件](./bull) 。



相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ✅    |
| 包含独立日志      | ✅    |



## 安装组件

```bash
$ npm i @midwayjs/cron@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/cron": "^3.0.0",
    // ...
  },
}
```



## 使用组件

将组件配置到代码中。

```typescript
import { Configuration } from '@midwayjs/core';
import * as cron from '@midwayjs/cron';

@Configuration({
  imports: [
    // ...
    cron
  ]
})
export class MainConfiguration {
  //...
}
```



## 编写任务处理类

使用 `@Job` 装饰器装饰一个类，用于快速定义一个任务处理器。

比如，在 `src/job` 目录中创建一个 `sync.job.ts`，用于某些数据同步任务，代码如下：

```typescript
// src/job/sync.job.ts
import { Job, IJob } from '@midwayjs/cron';
import { FORMAT } from '@midwayjs/core';

@Job({
  cronTime: FORMAT.CRONTAB.EVERY_PER_30_MINUTE,
  start: true,
})
export class DataSyncCheckerJob implements IJob {
  async onTick() {
    // ...
  }
}
```

`@Job` 装饰器用于修饰一个任务类，在初始化时，框架会自动将其转变为一个任务。

任务类需要实现 `IJob` 接口，实现 `onTick` 方法，每当任务触发时，会自动调用 `onTick` 方法。

此外，还有一个可选的 `onComplete` 方法，用于在 `onTick` 完成后执行。

```typescript
@Job({
  cronTime: FORMAT.CRONTAB.EVERY_PER_30_MINUTE,
  start: true,
})
export class DataSyncCheckerJob implements IJob {
  async onTick() {
    // ...
  }
  
  async onComplete() {
    // 记录一些数据等等，用处不是很大
  }
}
```



`@Job` 装饰器的常用参数如下：

| 参数      | 类型    | 描述                   |
| --------- | ------- | ---------------------- |
| cronTime  | string  | crontab 表达式         |
| start     | boolean | 是否自动启动任务       |
| runOnInit | boolean | 是否在初始化就执行一次 |

更多参数，请参考 [Cron](https://github.com/kelektiv/node-cron)。



## 任务管理

除了定时执行任务，我们还通过框架提供的 API，对任务进行手动管理。

比如，下面的代码仅仅定义了一个任务，但是不会启动执行。

```typescript
@Job('syncJob', {
  cronTime: '*/2 * * * * *',	// 每隔 2s 执行
})
export class DataSyncCheckerJob implements IJob {
  async onTick() {
    // ...
  }
}
```

我们定义了一个名为 `syncJob` 的任务，并且给它了一个默认的调度时间。



### 获取任务对象

我们可以通过两种方式获取任务对象。

通过`@InjectJob` 用来注入某个任务，参数为类本身或者任务名。

```typescript
// src/configuration.ts
import { Configuration, Inject } from '@midwayjs/core';
import * as cron from '@midwayjs/cron';
import { InjectJob, CronJob } from '@midwayjs/cron';
import { DataSyncCheckerJob } from './job/sync.job';

@Configuration({
  imports: [
    cron
  ],
})
export class ContainerConfiguration {
  @InjectJob(DataSyncCheckerJob)
  syncJob: CronJob;
  
  @InjectJob('syncJob')
  syncJob2: CronJob;

  async onServerReady() {
    // this.syncJob  === this.syncJob2
  }
}

```

通过 Framework API 获取。

```typescript
// src/configuration.ts
import { Configuration, Inject } from '@midwayjs/core';
import * as cron from '@midwayjs/cron';
import { InjectJob, CronJob } from '@midwayjs/cron';
import { DataSyncCheckerJob } from './job/sync.job';

@Configuration({
  imports: [
    cron
  ],
})
export class ContainerConfiguration {
  @Inject()
  cronFramework: cron.Framework;

  async onServerReady() {
    const syncJob = this.cronFramework.getJob(DataSyncCheckerJob);
    const syncJob2 = this.cronFramework.getJob('syncJob');
    
    // syncJob  === syncJob2
  }
}

```

:::caution

注意，任务对象都必须在 `onServerReady` 生命周期或者启动之后才能获取。

:::



### 启停任务

我们可以在初始化或者某些程序执行完成之后，将这个任务启动。

```typescript
// src/configuration.ts
import { Configuration, Inject } from '@midwayjs/core';
import * as cron from '@midwayjs/cron';
import { InjectJob, CronJob } from '@midwayjs/cron';
import { DataSyncCheckerJob } from './job/sync.job';

@Configuration({
  imports: [
    cron
  ],
})
export class ContainerConfiguration {
  @InjectJob(DataSyncCheckerJob)
  syncJob: CronJob;

  async onServerReady() {
    this.syncJob.start();
    
    // ...
    this.syncJob.stop();
  }
}

```



## 上下文

任务执行是在请求作用域中，其有着特殊的 Context 对象结构。

```typescript
export interface Context extends IMidwayContext {
  job: CronJob;
}
```

这里的  `CronJob` 类型来自于 `node-cron` 包。



## 组件日志

组件有着自己的日志，默认会将 `ctx.logger` 记录在 `midway-cron.log` 中。

我们可以单独配置这个 logger 对象。

```typescript
export default {
  midwayLogger: {
    // ...
    clients: {
      // ...
      cronLogger: {
        fileLogName: 'midway-cron.log',
      },
    }
  }
}
```

