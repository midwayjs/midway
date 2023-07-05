# 任务队列

队列是一种强大的设计模式，可帮助您应对常见的应用程序扩展和性能挑战。队列可以帮助您解决的一些问题。

示例如下：

-  平滑处理峰值。可以在任意时间启动资源密集型任务，然后将这些任务添加到队列中，而不是同步执行。让任务进程以受控方式从队列中提取任务。也可以轻松添加新的队列消费者以扩展后端任务处理。
- 分解可能会阻塞 Node.js 事件循环的单一任务。比如用户请求需要像音频转码这样的 CPU 密集型工作，就可以将此任务委托给其他进程，从而释放面向用户的进程以保持响应。
- 提供跨各种服务的可靠通信渠道。例如，您可以在一个进程或服务中排队任务（作业），并在另一个进程或服务中使用它们。在任何流程或服务的作业生命周期中完成、错误或其他状态更改时，您都可以收到通知（通过监听状态事件）。当队列生产者或消费者失败时，它们的状态被保留，并且当节点重新启动时任务处理可以自动重新启动。

Midway 提供了 @midwayjs/bull 包作为 [Bull](https://github.com/OptimalBits/bull) 之上的抽象/包装器，[Bull](https://github.com/OptimalBits/bull) 是一种流行的、受良好支持的、高性能的基于 Node.js 的队列系统实现。该软件包可以轻松地将 Bull Queues 以友好的方式集成到您的应用程序中。

Bull 使用 Redis 来保存作业数据，在使用 Redis 时，Queue 架构是完全分布式，和平台无关。例如，您可以在一个（或多个）节点（进程）中运行一些 Queue 生产者、消费者，而在其他节点上的运行其他生产者和消费者。

本章介绍 @midwayjs/bull 包。我们还建议阅读 [Bull 文档](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md) 以了解更多背景和具体实施细节。

:::tip

- 1、从 v3.6.0 开始，原有任务调度 `@midwayjs/task` 模块废弃，如果查询历史文档，请参考 [这里](../legacy/task)。
- 2、bull 是一个分布式任务管理系统，必须依赖 redis

:::



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
$ npm i @midwayjs/bull@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/bull": "^3.0.0",
    // ...
  },
}
```



## 使用组件

将 bull 组件配置到代码中。

```typescript
import { Configuration } from '@midwayjs/core';
import * as bull from '@midwayjs/bull';

@Configuration({
  imports: [
    // ...
    bull
  ]
})
export class MainConfiguration {
  //...
}
```



## 一些概念

Bull 将整个队列分为三个部分

- 1、Queue 队列，管理任务
- 2、Job，每个任务对象，可以对任务进行启停控制
- 3、Processor，任务处理，实际的逻辑执行部分



## 基础配置

bull 是一个分布式任务管理器，强依赖于 redis，在 `config.default.ts` 文件中配置。

```typescript
// src/config/config.default.ts
export default {
  // ...
  bull: {
    // 默认的队列配置
    defaultQueueOptions: {
      redis: `redis://127.0.0.1:32768`,
    }
  },
}
```

有账号密码情况：

```typescript
// src/config/config.default.ts
export default {
  // ...
  bull: {
    defaultQueueOptions: {
      redis: {
        port: 6379,
        host: '127.0.0.1',
        password: 'foobared',
      },
    }
  },
}
```

所有的队列都会复用该配置。



## 编写任务处理器

使用 `@Processor` 装饰器装饰一个类，用于快速定义一个任务处理器（这里我们不使用 Job，避免后续的歧义）。

`@Processor` 装饰器需要传递一个 Queue （队列）的名字，在框架启动时，如果没有名为 `test` 的队列，则会自动创建。

比如，我们在 `src/queue/test.queue.ts` 文件中编写如下代码。

```typescript
// src/queue/test.queue.ts
import { Processor, IProcessor } from '@midwayjs/bull';

@Processor('test')
export class TestProcessor implements IProcessor {
  async execute() {
    // ...
  }
}
```

在启动时，框架会自动查找并初始化上述处理器代码，同时自动创建一个名为 `test` 的 Queue。





## 执行任务

当定义完 Processor 之后，由于并未指定 Processor 如何执行，我们还需要手动执行它。

通过获取对应的队列，我们可以很方便的来执行任务。



### 手动执行任务

比如，我们可以在项目启动后执行。

```typescript
import { Configuration, Inject } from '@midwayjs/core';
import * as bull from '@midwayjs/bull';

@Configuration({
  imports: [
    // ...
    bull
  ]
})
export class MainConfiguration {

  @Inject()
  bullFramework: bull.Framework;

  //...

  async onServerReady() {
    // 获取 Processor 相关的队列
    const testQueue = this.bullFramework.getQueue('test');
    // 立即执行这个任务
    await testQueue?.runJob();
  }
}
```



### 增加执行参数

我们也可以在执行时，附加一些默认参数。

```typescript
@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(params) {
    // params.aaa => 1
  }
}


// invoke
const testQueue = this.bullFramework.getQueue('test');
// 立即执行这个任务
await testQueue?.runJob({
  aaa: 1,
  bbb: 2,
});
```



### 任务状态和管理

执行 `runJob` 后，我们可以获取到一个 `Job` 对象。

```typescript
// invoke
const testQueue = this.bullFramework.getQueue('test');
const job = await testQueue?.runJob();
```

通过这个 Job 对象，我们可以做进度管理。

```typescript
// 更新进度
await job.progress(60);
// 获取进度
const progress = await job.process();
// => 60
```

获取任务状态。

```typescript
const state = await job.getState();
// state => 'delayed' 延迟状态
// state => 'completed' 完成状态
```

更多的 Job API，请查看 [文档](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md)。



### 延迟执行

执行任务时，也有一些额外的选项。

比如，延迟 1s 执行。

```typescript
const testQueue = this.bullFramework.getQueue('test');
// 立即执行这个任务
await testQueue?.runJob({}, { delay: 1000 });
```



### 中间件和错误处理

Bull 组件包含可以独立启动的 Framework，有着自己的 App 对象和 Context 结构。

我们可以对 bull 的 App 配置独立的中间件和错误过滤器。

```typescript
@Configuration({
  imports: [
    // ...
    bull
  ]
})
export class MainConfiguration {

  @App('bull')
  bullApp: bull.Application;

  //...

  async onReady() {
    this.bullApp.useMiddleare( /*中间件*/);
    this.bullApp.useFilter( /*过滤器*/);
  }
}
```



### 上下文

任务处理器执行是在请求作用域中，其有着特殊的 Context 对象结构。

```typescript
export interface Context extends IMidwayContext {
  jobId: JobId;
  job: Job,
  from: new (...args) => IProcessor;
}
```

我们可以直接从 ctx 中访问当前的 Job 对象。

```typescript
// src/queue/test.queue.ts
import { Processor, IProcessor, Context } from '@midwayjs/bull';

@Processor('test')
export class TestProcessor implements IProcessor {

  @Inject()
  ctx: Context;

  async execute() {
    // ctx.jobId => xxxx
  }
}
```



### 更多任务选项

除了上面的 delay 之外，还有更多的执行选项。

| 选项             | 类型                  | 描述                                                         |
| ---------------- | --------------------- | ------------------------------------------------------------ |
| priority         | number                | 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意，使用优先级对性能有轻微影响，因此请谨慎使用。 |
| delay            | number                | 等待可以处理此作业的时间量（毫秒）。请注意，为了获得准确的延迟，服务器和客户端都应该同步它们的时钟。 |
| attempts         | number                | 在任务完成之前尝试尝试的总次数。                             |
| repeat           | RepeatOpts            | 根据 cron 规范的重复任务配置，更多可以查看 [RepeatOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)，以及下面的重复任务介绍。 |
| backoff          | number \| BackoffOpts | 任务失败时自动重试的回退设置。请参阅 [BackoffOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。 |
| lifo             | boolean               | 如果为 true，则将任务添加到队列的右端而不是左端（默认为 false）。 |
| timeout          | number                | 任务因超时错误而失败的毫秒数。                               |
| jobId            | number \| string      | 覆盖任务 id - 默认情况下，任务 id 是唯一整数，但您可以使用此设置覆盖它。如果您使用此选项，则由您来确保 jobId 是唯一的。如果您尝试添加一个 id 已经存在的任务，它将不会被添加。 |
| removeOnComplete | boolean \| number     | 如果为 true，则在成功完成后删除任务。如果设置数字，则为指定要保留的任务数量。默认行为是任务信息保留在已完成列表中。 |
| removeOnFail     | boolean \| number     | 如果为 true，则在所有尝试后都失败时删除任务。如果设置数字，指定要保留的任务数量。默认行为是将任务信息保留在失败列表中。 |
| stackTraceLimit  | number                | 限制将在堆栈跟踪中记录的堆栈跟踪行的数量。                   |



## 重复执行的任务

除了手动执行的方式，我们也可以通过 `@Processor` 装饰器的参数，快速配置任务的重复执行。

```typescript
import { Processor, IProcessor } from '@midwayjs/bull';
import { FORMAT } from '@midwayjs/core';

@Processor('test', {
  repeat: {
    cron: FORMAT.CRONTAB.EVERY_PER_5_SECOND
  }
})
export class TestProcessor implements IProcessor {
  @Inject()
  logger;

  async execute() {
    // ...
  }
}
```



## 常用 Cron 表达式

关于 Cron 表达式，格式如下。

```typescript
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```



常见表达式：

- 每隔5秒执行一次：`*/5 * * * * *`
- 每隔1分钟执行一次：`0 */1 * * * *`
- 每小时的20分执行一次：`0 20 * * * *`
- 每天 0 点执行一次：`0 0 0 * * *`
- 每天的两点35分执行一次：`0 35 2 * * *`

可以使用 [在线工具](https://cron.qqe2.com/) 执行确认下一次执行的时间。

Midway 在框架侧提供了一些常用的表达式，放在 `@midwayjs/core` 中供大家使用。

```typescript
import { FORMAT } from '@midwayjs/core';

// 每分钟执行的 cron 表达式
FORMAT.CRONTAB.EVERY_MINUTE
```



内置的还有一些其他的表达式。

| 表达式                         | 对应时间        |
| ------------------------------ | --------------- |
| CRONTAB.EVERY_SECOND           | 每秒钟          |
| CRONTAB.EVERY_MINUTE           | 每分钟          |
| CRONTAB.EVERY_HOUR             | 每小时整点      |
| CRONTAB.EVERY_DAY              | 每天 0 点       |
| CRONTAB.EVERY_DAY_ZERO_FIFTEEN | 每天 0 点 15 分 |
| CRONTAB.EVERY_DAY_ONE_FIFTEEN  | 每天 1 点 15 分 |
| CRONTAB.EVERY_PER_5_SECOND     | 每隔 5 秒       |
| CRONTAB.EVERY_PER_10_SECOND    | 每隔 10 秒      |
| CRONTAB.EVERY_PER_30_SECOND    | 每隔 30 秒      |
| CRONTAB.EVERY_PER_5_MINUTE     | 每隔 5 分钟     |
| CRONTAB.EVERY_PER_10_MINUTE    | 每隔 10 分钟    |
| CRONTAB.EVERY_PER_30_MINUTE    | 每隔 30 分钟    |



## 高级配置



### 清理之前的任务

在默认情况下，框架会自动清理前一次未调度的 **重复执行任务**，保持每一次的重复执行的任务队列为最新。如果在某些环境不需要清理，可以单独关闭。

比如你不需要清理重复：

```typescript
// src/config/config.prod.ts
export default {
  // ...
  bull: {
    clearRepeatJobWhenStart: false,
  },
}
```

:::tip

如果不清理，如果前一次队列为 10s 执行，现在修改为 20s 执行，则两个定时都会存储在 Redis 中，导致代码重复执行。

在日常的开发中，如果不清理，很容易出现代码重复执行这个问题。但是在集群部署的场景，多台服务器轮流重启的情况下，可能会导致定时任务被意外清理，请评估开关的时机。

:::



也可以在启动时手动清理所有任务。

```typescript
// src/configuration.ts
import { Configuration, App, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { join } from 'path';
import * as bull from '@midwayjs/bull';

@Configuration({
  imports: [koa, bull],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  @Inject()
  bullFramework: bull.Framework;

  async onReady() {
    // 在这个阶段，装饰器队列还未创建，使用 API 提前手动创建队列，装饰器会复用同名队列
    const queue = this.bullFramework.createQueue('user');
    // 通过队列手动执行清理
    await queue.obliterate({ force: true });
  }
}
```





### 清理任务历史记录

当开启 Redis 后，默认情况下，bull 会记录所有的成功和失败的任务 key，这可能会导致 redis 的 key 暴涨，我们可以配置成功或者失败后清理的选项。

默认情况下

- 成功时保留的任务记录为 3 条
- 失败保留的任务记录为 10 条

也可以通过参数进行配置。

比如在装饰器配置。

```typescript
import { FORMAT } from '@midwayjs/core';
import { IProcessor, Processor } from '@midwayjs/bull';

@Processor('user', {
  repeat: {
    cron: FORMAT.CRONTAB.EVERY_MINUTE,
  },
  removeOnComplete: 3,	// 成功后移除任务记录，最多保留最近 3 条记录
  removeOnFail: 10,	    // 失败后移除任务记录
})
export class UserService implements IProcessor {
  execute(data: any) {
    // ...
  }
}

```

也可以在全局 config 中配置。

```typescript
// src/config/config.default.ts
export default {
  // ...
  bull: {
    defaultQueueOptions: {
      // 默认的任务配置
      defaultJobOptions: {
        // 保留 10 条记录
        removeOnComplete: 10,
      },
    },
  },
}
```





### Redis 集群

可以使用 bull 提供的 `createClient` 方式来接入自定义的 redis 实例，这样你可以接入 Redis 集群。

比如：

```typescript
// src/config/config.default
import Redis from 'ioredis';

const clusterOptions = {
  enableReadyCheck: false,  // 一定要是false
  retryDelayOnClusterDown: 300,
  retryDelayOnFailover: 1000,
  retryDelayOnTryAgain: 3000,
  slotsRefreshTimeout: 10000,
  maxRetriesPerRequest: null  // 一定要是null
}

const redisClientInstance = new Redis.Cluster([
  {
    port: 7000,
    host: '127.0.0.1'
  },
  {
    port: 7002,
    host: '127.0.0.1'
  },
], clusterOptions);

export default {
  bull: {
    defaultQueueOptions: {
      createClient: (type, opts) => {
        return redisClientInstance;
      },
      // 这些任务存储的 key，都是相同开头，以便区分用户原有 redis 里面的配置
      prefix: '{midway-bull}',
    },
  }
}
```



## 队列管理

队列是廉价的，每个 Job 都会绑定一个队列，在一些情况下，我们也可以手动对队列进行管理操作。



### 手动创建队列

除了使用 `@Processor` 简单定义队列，我们还可以使用 API 进行创建。

```typescript
import { Configuration, Inject } from '@midwayjs/core';
import * as bull from '@midwayjs/bull';

@Configuration({
  imports: [
    // ...
    bull
  ]
})
export class MainConfiguration {

  @Inject()
  bullFramework: bull.Framework;

  async onReady() {
    const testQueue = this.bullFramework.createQueue('test', {
      redis: {
        port: 6379,
        host: '127.0.0.1',
        password: 'foobared',
      },
      prefix: '{midway-bull}',
    });

    // ...
  }
}
```

通过 `createQueue` 手动创建队列后，队列依旧会自动保存。如果在启动时 `@Processor` 使用了该队列名，则会自动使用已经创建好的队列。

比如：

```typescript
// 会自动使用上面手动创建的同名队列
@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(params) {
  }
}
```



### 获取队列

我们可以简单的根据队列名获取队列。

```typescript
 const testQueue = bullFramework.getQueue('test');
```

也可以通过装饰器来获取。

```typescript
import { InjectQueue, BullQueue } from '@midwayjs/bull';
import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  @InjectQueue('test')
  testQueue: BullQueue;

  async invoke() {
    await this.testQueue.pause();
    // ...
  }
}
```



### 队列常用操作

暂停队列。

```typescript
await testQueue.pause();
```

继续队列。

```typescript
await testQueue.resume();
```

队列事件。

```typescript
// Local events pass the job instance...
testQueue.on('progress', function (job, progress) {
  console.log(`Job ${job.id} is ${progress * 100}% ready!`);
});

testQueue.on('completed', function (job, result) {
  console.log(`Job ${job.id} completed! Result: ${result}`);
  job.remove();
});
```

完整队列 API 请参考 [这里](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md)。



## 组件日志

组件有着自己的日志，默认会将 `ctx.logger` 记录在 `midway-bull.log` 中。

我们可以单独配置这个 logger 对象。

```typescript
export default {
  midwayLogger: {
    // ...
    bullLogger: {
      fileLogName: 'midway-bull.log',
    },
  }
}
```

这个日志的输出格式，我们也可以单独配置。

```typescript
export default {
  bull: {
    // ...
    contextLoggerFormat: info => {
      const { jobId, from } = info.ctx;
      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}`;
    },
  }
}
```



## Bull UI

在分布式场景中，我们可以资利用 Bull UI 来简化管理。

和 bull 组件类似，需要独立安装和启用。

```bash
$ npm i @midwayjs/bull-board@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/bull-board": "^3.0.0",
    // ...
  },
}
```

将 bull-board 组件配置到代码中。

```typescript
import { Configuration } from '@midwayjs/core';
import * as bull from '@midwayjs/bull';
import * as bullBoard from '@midwayjs/bull-board';

@Configuration({
  imports: [
    // ...
    bull,
    bullBoard,
  ]
})
export class MainConfiguration {
  //...
}
```

默认的访问路径为：`http://127.1:7001/ui`。

效果如下：

![](https://img.alicdn.com/imgextra/i2/O1CN01j4wEFb1UacPxA06gs_!!6000000002534-2-tps-1932-1136.png)

可以通过配置进行基础路径的修改。

```typescript
// src/config/config.prod.ts
export default {
  // ...
  bullBoard: {
    basePath: '/ui',
  },
}
```





## 常见问题

### 1、EVALSHA错误

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01KfjCKT1yypmNPDkIL_!!6000000006648-2-tps-3540-102.png)

这个问题基本明确，问题会出现在 redis 的集群版本上。

原因是 redis 会对 key 做 hash 来确定存储的 slot，集群下这一步 @midwayjs/bull 的 key 命中了不同的 slot。

解决办法是 task 里的 prefix 配置用 {} 包括，强制 redis 只计算 {} 里的hash，例如 `prefix: '{midway-task}'`。

