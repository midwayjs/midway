# 任务队列

队列是一种强大的设计模式，可帮助您应对常见的应用程序扩展和性能挑战。队列可以帮助您解决的一些问题：

- 平滑处理峰值。可以在任意时间启动资源密集型任务，然后将这些任务添加到队列中，而不是同步执行。让任务进程以受控方式从队列中提取任务。也可以轻松添加新的队列消费者以扩展后端任务处理。
- 分解可能会阻塞 Node.js 事件循环的单一任务。比如用户请求需要像音频转码这样的 CPU 密集型工作，就可以将此任务委托给其他进程，从而释放面向用户的进程以保持响应。
- 提供跨各种服务的可靠通信渠道。例如，您可以在一个进程或服务中排队任务（作业），并在另一个进程或服务中使用它们。在任何流程或服务的作业生命周期中完成、错误或其他状态更改时，您都可以收到通知（通过监听状态事件）。当队列生产者或消费者失败时，它们的状态被保留，并且当节点重新启动时任务处理可以自动重新启动。

Midway 提供了 `@midwayjs/bullmq` 包作为 [BullMQ](https://github.com/taskforcesh/bullmq) 之上的抽象/包装器。BullMQ 是 Bull 的下一代实现，提供了更好的性能和更多的功能。该软件包可以轻松地将 BullMQ 以友好的方式集成到您的应用程序中。

BullMQ 使用 Redis 来保存作业数据，在使用 Redis 时，Queue 架构是完全分布式，和平台无关。例如，您可以在一个（或多个）节点（进程）中运行一些 Queue 生产者、消费者，而在其他节点上的运行其他生产者和消费者。

:::tip
BullMQ 是一个分布式任务管理系统，必须依赖 redis
:::

:::caution
由于 BullMQ 是 Bull 的升级版，从 v3.20 开始，将由 BullMQ 替代 Bull 组件，如需使用 Bull 组件，请参考 [Bull 文档](./bull)
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
$ npm i @midwayjs/bullmq@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/bullmq": "^3.0.0",
    // ...
  },
}
```

## 使用组件

将 bullmq 组件配置到代码中。

```typescript
import { Configuration } from '@midwayjs/core';
import * as bullmq from '@midwayjs/bullmq';

@Configuration({
  imports: [
    // ...
    bullmq
  ]
})
export class MainConfiguration {
  //...
}
```

## 一些概念

BullMQ 将整个队列分为以下几个部分：

- Queue：队列，管理任务
- Job：每个任务对象，可以对任务进行启停控制
- Worker：任务处理器，实际的逻辑执行部分
- QueueEvents：队列事件，用于监听任务状态变化
- FlowProducer：任务流生产者，用于创建任务依赖关系

## 基础配置

bullmq 是一个分布式任务管理器，强依赖于 redis，在 `config.default.ts` 文件中配置。

```typescript
// src/config/config.default.ts
export default {
  // ...
  bullmq: {
    defaultConnection: {
      host: '127.0.0.1',
      port: 6379,
    },
    // 可选，队列前缀
    defaultPrefix: '{midway-bullmq}',
  },
}
```

有账号密码情况：

```typescript
// src/config/config.default.ts
export default {
  // ...
  bullmq: {
    defaultConnection: {
      port: 6379,
      host: '127.0.0.1',
      password: 'foobared',
    }
  },
}
```

所有的队列、任务处理器、队列事件、任务流都会复用该配置。

## 编写任务处理器

使用 `@Processor` 装饰器装饰一个类，用于快速定义一个任务处理器。

`@Processor` 装饰器需要传递一个 Queue（队列）的名字，在框架启动时，如果没有名为 `test` 的队列，则会自动创建。

比如，我们在 `src/processor/test.processor.ts` 文件中编写如下代码。

```typescript
import { Processor, IProcessor } from '@midwayjs/bullmq';

@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(data: any) {
    // 处理任务逻辑
    console.log('processing job:', data);
  }
}
```

## 执行任务

当定义完 Processor 之后，由于并未指定 Processor 如何执行，我们还需要手动执行它。

### 手动执行任务

```typescript
import { Configuration, Inject } from '@midwayjs/core';
import * as bullmq from '@midwayjs/bullmq';

@Configuration({
  imports: [
    bullmq
  ]
})
export class MainConfiguration {

  @Inject()
  bullmqFramework: bullmq.Framework;

  async onServerReady() {
    // 获取 Processor 相关的队列
    const testQueue = this.bullmqFramework.getQueue('test');
    // 立即添加这个任务
    await testQueue?.addJobToQueue();
  }
}
```

### 增加执行参数

我们也可以在执行时，附加一些参数。

```typescript
@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(params) {
    // params.name => 'harry'
  }
}

// invoke
const testQueue = this.bullmqFramework.getQueue('test');
await testQueue?.addJobToQueue({
  aaa: 1,
  bbb: 2,
});
```

### 任务状态和管理

执行 `addJobToQueue` 后，我们可以获取到一个 `Job` 对象。

```typescript
const testQueue = this.bullmqFramework.getQueue('test');
const job = await testQueue?.addJobToQueue();

// 更新进度
await job.updateProgress(60);
// 获取进度
const progress = await job.progress;
// => 60

// 获取任务状态
const state = await job.getState();
// state => 'delayed' 延迟状态
// state => 'completed' 完成状态
// state => 'failed' 失败状态
```

### 延迟执行

执行任务时，也有一些额外的选项。

比如，延迟 1s 执行。

```typescript
const testQueue = this.bullmqFramework.getQueue('test');
await testQueue?.addJobToQueue({}, { delay: 1000 });
```

### 任务重试

BullMQ 支持任务失败重试机制。

```typescript
const testQueue = this.bullmqFramework.getQueue('test');
await testQueue?.addJobToQueue({}, {
  attempts: 3,  // 最多重试 3 次
  backoff: {    // 重试策略
    type: 'exponential',  // 指数退避
    delay: 1000          // 初始延迟 1 秒
  }
});
```

### 任务优先级

可以为任务设置优先级，优先级高的任务会优先执行。

```typescript
const testQueue = this.bullmqFramework.getQueue('test');
// priority 值越大优先级越高
await testQueue?.addJobToQueue({ priority: 1 }, { priority: 3 }); // 高优先级
await testQueue?.addJobToQueue({ priority: 2 }, { priority: 2 }); // 中优先级
await testQueue?.addJobToQueue({ priority: 3 }, { priority: 1 }); // 低优先级
```

### 中间件和错误处理

BullMQ 组件包含可以独立启动的 Framework，有着自己的 App 对象和 Context 结构。

我们可以对 bullmq 的 App 配置独立的中间件和错误过滤器。

```typescript
@Configuration({
  imports: [
    bullmq
  ]
})
export class MainConfiguration {

  @App('bullmq')
  bullmqApp: bullmq.Application;

  async onReady() {
    this.bullmqApp.useMiddleware(/*中间件*/);
    this.bullmqApp.useFilter(/*过滤器*/);
  }
}
```

### 上下文

任务处理器执行是在请求作用域中，其有着特殊的 Context 对象结构。

```typescript
export interface Context extends IMidwayContext {
  jobId: string;
  job: Job;
  token?: string;
  from: new (...args) => IProcessor;
}
```

我们可以直接从 ctx 中访问当前的 Job 对象。

```typescript
import { Processor, IProcessor, Context } from '@midwayjs/bullmq';

@Processor('test')
export class TestProcessor implements IProcessor {
  @Inject()
  ctx: Context;

  async execute(data: any) {
    // ctx.jobId => 当前任务ID
    // ctx.job => 当前任务对象
  }
}
```

## 重复执行的任务

除了手动执行的方式，我们也可以通过 `@Processor` 装饰器的参数，快速配置任务的重复执行。

```typescript
import { Processor, IProcessor } from '@midwayjs/bullmq';
import { FORMAT } from '@midwayjs/core';

@Processor('test', {
  repeat: {
    pattern: FORMAT.CRONTAB.EVERY_PER_5_SECOND
  }
})
export class TestProcessor implements IProcessor {
  async execute() {
    // 每 5 秒执行一次
  }
}
```

## 高级功能

### 任务流（Flow Producer）

BullMQ 支持创建任务依赖关系，形成任务流。

```typescript
const flowProducer = bullmqFramework.createFlowProducer({}, 'test-flow');

// 创建任务流
await flowProducer.add({
  name: 'flow-test',
  queueName: 'flow-queue-1',
  data: { value: 1 },
  children: [
    {
      name: 'child-job',
      queueName: 'flow-queue-2',
      data: { value: 2 }
    }
  ]
});
```

### 队列事件

BullMQ 提供了丰富的事件系统，可以监听任务的各种状态变化。

```typescript
const eventQueue = bullmqFramework.createQueue('event-queue');
const queueEvents = eventQueue.createQueueEvents();

// 监听任务完成事件
queueEvents.on('completed', ({ jobId }) => {
  console.log(`Job ${jobId} completed!`);
});

// 监听任务失败事件
queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.log(`Job ${jobId} failed: ${failedReason}`);
});
```

### 清理任务历史记录

当开启 Redis 后，默认情况下，bullmq 会记录所有的成功和失败的任务 key，这可能会导致 redis 的 key 暴涨，我们可以配置成功或者失败后清理的选项。

```typescript
// src/config/config.default.ts
export default {
  bullmq: {
    defaultQueueOptions: {
      defaultJobOptions: {
        removeOnComplete: 3,  // 成功后只保留最近 3 条记录
        removeOnFail: 10,     // 失败后只保留最近 10 条记录
      }
    }
  }
}
```

### Redis 集群

bullmq 可以指定 connection 实例，你可以将自己创建的 Redis 实例配置到 `defaultConnection` 中，这样就可以接入 Redis 集群。

```typescript
// src/config/config.default.ts
import Redis from 'ioredis';

const clusterOptions = {
  enableReadyCheck: false,
  retryDelayOnClusterDown: 300,
  retryDelayOnFailover: 1000,
  retryDelayOnTryAgain: 3000,
  slotsRefreshTimeout: 10000,
  maxRetriesPerRequest: null
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
  bullmq: {
    defaultConnection: redisClientInstance,
    defaultPrefix: '{midway-bullmq}',
  }
}
```

## 组件日志

组件有着自己的日志，默认会将 `ctx.logger` 记录在 `midway-bullmq.log` 中。

我们可以单独配置这个 logger 对象。

```typescript
export default {
  midwayLogger: {
    clients: {
      bullMQLogger: {
        fileLogName: 'midway-bullmq.log',
      },
    },
  },
}
```

这个日志的输出格式，我们也可以单独配置。

```typescript
export default {
  bullmq: {
    contextLoggerFormat: info => {
      const { jobId, from } = info.ctx;
      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}`;
    },
  }
}
```

## BullMQ 原始对象

组件导出了 BullMQ 的原始对象，可以进行更多的操作。

```typescript
import { BullMQ } from '@midwayjs/bullmq';
```

你可以通过 `BullMQ` 对象，获取到 `Queue`、`Worker`、`FlowProducer` 等对象定义。

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
import * as bullmq from '@midwayjs/bullmq';
import * as bullBoard from '@midwayjs/bull-board';

@Configuration({
  imports: [
    // ...
    bullmq,
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

此外，组件提供了 `BullBoardManager` ，可以添加动态创建的队列。

```typescript
import { Configuration, Inject } from '@midwayjs/core';
import * as bullmq from '@midwayjs/bullmq';
import * as bullBoard from '@midwayjs/bull-board';

@Configuration({
  imports: [
    // ...
    bullmq,
    bullBoard
  ]
})
export class MainConfiguration {

  @Inject()
  bullmqFramework: bullmq.Framework;
  
  @Inject()
  bullBoardManager: bullBoard.BullBoardManager;

  async onServerReady() {
    const testQueue = this.bullmqFramework.createQueue('test', {
      // ...
    });

    this.bullBoardManager.addQueue(new bullBoard.BullMQAdapter(testQueue) as any);
  }
}
```

由于最新 bull-board 要求最低 Node.js 版本为 v20，所以 Midway v3 无法将 bull-board 升级；在 v5.23.0 版本下的 `bull-board` 存在类型定义问题，采用 `as any`  的方式绕过。
