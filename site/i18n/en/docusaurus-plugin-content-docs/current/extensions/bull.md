# Task Queues

Queues are a powerful design pattern that can help you meet common application scaling and performance challenges. Some of the problems queues can help you solve.

Examples are as follows.

- Smoothing out peaks. You can start resource-intensive tasks at any time and then add them to a queue instead of executing them synchronously. Let task processes pull tasks from the queue in a controlled manner. It is also easy to add new queue consumers to extend back-end task processing.
- Decompose single tasks that might block the Node.js event loop. For example, if a user request requires CPU-intensive work like audio transcoding, this task can be delegated to another process, freeing up the user-facing process to maintain a response.
- Provide reliable communication channels across various services. For example, you can queue tasks (jobs) in one process or service and use them in another process or service. You can receive notifications (by listening for status events) when a job completes, errors, or other status changes during the job lifecycle of any process or service. When a queue producer or consumer fails, their state is retained and job processing can be automatically restarted when the node is restarted.

Midway provides the @midwayjs/bull package as an abstraction/wrapper on top of [Bull](https://github.com/OptimalBits/bull), a popular, well-supported, high performance NPP-based application. well-supported, high-performance implementation of the Node.js-based queueing system. This package makes it easy to integrate Bull Queues into your application.

Bull uses Redis to hold job data, and when using Redis, the Queue architecture is fully distributed and platform independent. For example, you can run some Queue producers, consumers in one (or more) nodes (processes), and other producers and consumers on other nodes.

This chapter introduces the @midwayjs/bull package. We also recommend reading the [Bull documentation](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md) for more background and implementation details.

:::tip

- 1. As of v3.6.0, the original task scheduling `@midwayjs/task` module is deprecated, so if you check the history documentation, please refer to [here](. /legacy/task).
- 2. bull is a distributed task management system and must rely on redis

:::



Related information.

| description | |
| ----------------- | ---- |
| Available for standard projects | ✅ |
| Available for Serverless | ❌ |
| Available for Integration | ✅ |
| Include standalone mainframe | ✅ |
| Includes standalone logging | ✅ |



## Installing components

```bash
$ npm i @midwayjs/bull@3 --save
```

Or reinstall it after adding the following dependencies to ``package.json``.

```json
{
  "dependencies": {
    "@midwayjs/bull": "^3.0.0",
    // ...
  },
}
```



## Using components

Configure the bull component into the code.

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
  // ...
}
```



## Some concepts

Bull divides the entire queue into three parts

- 1, Queue queue, which manages tasks
- 2, Job, each task object, you can start and stop control of the task
- 3、Processor, task processing, the actual logical execution part



## Basic configuration

bull is a distributed task manager with a strong dependency on redis, configured in the ``config.default.ts`` file.

```typescript
// src/config/config.default.ts
export default {
  // ...
  bull: {
    // default queue configuration
    defaultQueueOptions: {
    	redis: 'redis://127.0.0.1:32768',
    }
  },
}
```

With account password case.

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

All queues will reuse this configuration.



## Writing task processors

Use the `@Processor` decorator to decorate a class for quickly defining a task processor (we don't use Job here to avoid subsequent ambiguity).

The `@Processor` decorator needs to be passed the name of a Queue (queue) that will be created automatically when the framework starts if there is no queue named `test`.

For example, we write the following code in the `src/queue/test.queue.ts` file.

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

At startup, the framework automatically finds and initializes the above processor code, and automatically creates a Queue named `test`.





## Executing tasks

After defining the Processor, we need to execute it manually since it is not specified how to execute it.

By getting the corresponding queue, we can easily execute the task.



### Executing tasks manually

For example, we can execute it after the project is started.

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
  bullFramework: bull;

  //...

  async onServerReady() {
    // Get the Processor-related queue
    const testQueue = this.bullFramework.getQueue('test');
    // Execute this task immediately
    await testQueue?.runJob();
  }
}
```



### Adding execution parameters

We can also attach some default parameters to the execution.

```typescript
@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(params) {
    // params.aaa => 1
  }
}


// invoke
const testQueue = this.bullFramework.getQueue('test');
// Execute this task immediately
await testQueue?.runJob({
  aaa: 1,
  bbb: 2,
});
```



### Task status and management

After executing `runJob`, we can get a `Job` object.

```typescript
// invoke
const testQueue = this.bullFramework.getQueue('test');
const job = await testQueue?.runJob();
```

With this Job object, we can do progress management.

```typescript
// Update progress
await job.progress(60);
// Get the progress
const progress = await job.process();
// => 60
```

Gets the job status.

```typescript
const state = await job.getState();
// state => 'delayed' Delayed state
// state => 'completed' completed state
```

For more Job API, please see [documentation](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md).



### Delayed execution

There are also some additional options when executing tasks.

For example, delay execution by 1s.

```typescript
const testQueue = this.bullFramework.getQueue('test');
// Execute this task immediately
await testQueue?.runJob({}, { delay: 1000 });
```



### Middleware and error handling

The Bull component contains a framework that can be started independently, with its own App object and Context structure.

We can configure separate middleware and error filters for bull's App.

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
    this.bullApp.useMiddleare( /*middleware*/);
    this.bullApp.useFilter( /*filter*/);
  }
}
```

### Context

The task processor execution is in the request scope, which has a special Context object structure.

```typescript
export interface Context extends IMidwayContext {
  jobId: JobId;
  job: Job,
  from: new (...args) => IProcessor;
}
```

We can access the current Job object directly from the ctx.

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



### More task options

In addition to the above delay, there are more execution options.

| options | type | description |
| ---------------- | --------------------- | ------------------------------------------------------------ |
| priority | number | The optional priority value. The range is from 1 (highest priority) to MAX_INT (lowest priority). Note that using priority has a slight performance impact, so please use it with caution. | delay
| delay | number | The amount of time (in milliseconds) to wait for this job to be processed. Note that both the server and the client should synchronize their clocks in order to get an accurate delay. | attempts
| attempts | number | The total number of attempts before the job completes.                             |Repeat
| repeat | RepeatOpts | Repeat task configuration according to the cron specification, see [RepeatOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd) for more information, and the following Repeat tasks are described below. |backoff
| backoff | number \| BackoffOpts | Backoff settings for automatic retries on task failure. See [BackoffOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd). | lifo
| lifo | boolean | If true, add the task to the right end of the queue instead of the left end (default is false). | timeout
| timeout | number | The number of milliseconds for which the task failed due to a timeout error.                               |jobId
| jobId | number \| string | Override job id - By default, the job id is a unique integer, but you can use this setting to override it. If you use this option, it is up to you to ensure that the jobId is unique. If you try to add a job with an id that already exists, it will not be added. | removeOnComplete
| removeOnComplete | boolean \| number | If true, removes the job upon successful completion. If set to number, the number of tasks to keep for the specified task. The default behavior is to keep the task information in the completed list. |
| removeOnFail | boolean \| number | If true, removes the task if it fails after all attempts. If set to number, specify the number of tasks to keep. The default behavior is to keep the task information in the failed list. |
| stackTraceLimit | number | Limits the number of stack trace lines that will be recorded in the stack trace.                   | ##



## Repeatedly executed tasks

In addition to manual execution, we can also quickly configure repeated execution of tasks with the ``@Processor`` decorator parameter.

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



## Common Cron expressions

For Cron expressions, the format is as follows.

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



Common expressions.

- Execute every 5 seconds: `*/5 * * * * * *`
- Execute every 1 minute: `0 */1 * * * * * `
- Once every hour at 20 minutes: `0 20 * * * * * `
- Once a day at 0:00: `0 0 0 * * * *`
- Once a day at 2:35: `0 35 2 * * * *`

You can use the [online tool](https://cron.qqe2.com/) to confirm the time of the next execution.

Midway provides some common expressions on the framework side in `@midwayjs/core` for your use.

```typescript
import { FORMAT } from '@midwayjs/core';

// cron expressions executed per minute
FORMAT.CRONTAB.EVERY_MINUTE
```



There are some other expressions built in.

| expression | corresponding time |
| ------------------------------ | --------------- |
| CRONTAB.EVERY_SECOND | per second |
| CRONTAB.EVERY_MINUTE | per minute |
| CRONTAB.EVERY_HOUR | Hourly
| EVERY_DAY | Every day at 0:00 |
| EVERY_DAY_ZERO_FIFTEEN | 0:15 PM per day |
| EVERY_DAY_ONE_FIFTEEN | 1:15 PM per day
| EVERY_PER_5_SECOND | every 5 seconds
| EVERY_PER_10_SECOND | every 10 seconds |
| EVERY_PER_30_SECOND | every 30 seconds |
| CRONTAB.EVERY_PER_5_MINUTE | every 5 minutes |
| EVERY_PER_10_MINUTE | every 10 minutes |
| EVERY_PER_30_MINUTE | every 30 minutes |



## Advanced Configuration


### Clean up previous tasks

By default, the framework automatically cleans up any previously unscheduled **repeating tasks**, keeping the queue of repeating tasks up to date for each one. If you don't need to clean up in some environments, you can turn it off separately.

For example, you do not need to clean up duplicates of.

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

If you don't clean up, if the previous queue is executed at 10s and now it is modified to 20s, both timings will be stored in Redis, resulting in duplicate code execution.

In daily development, if you do not clean up, it is easy to have this problem of repeated code execution. However, in a cluster deployment scenario, where multiple servers are restarted in turn, it may cause the timing task to be cleaned up accidentally, please evaluate the timing of the switch.

:::



It is also possible to clean up all tasks manually at startup.

```typescript
// src/configuration.ts
import { Configuration, App, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { join } from 'path';
import * as bull from '@midwayjs/bull';

@Configuration({
  imports: [koa, bull],
  importConfigs: [join(__dirname, '. /config')],
})
export class MainConfiguration {
  @App()
  app: koa;

  @Inject()
  bullFramework: bull;

  async onReady() {
    // At this stage, the decorator queue has not been created yet, use the API to create the queue manually in advance, the decorator will reuse the queue with the same name
    const queue = this.bullFramework.createQueue('user');
    // perform cleanup manually via queue
    await queue.obliterate({ force: true });
  }
}
```





### Clearing task history

When Redis is turned on, by default, bull will record all successful and failed task keys, which may cause a key spike in redis, we can configure the option to clean up after success or failure.

By default

- 3 task records are kept on success
- 10 task records are retained on failure

This can also be configured via parameters.

For example, in the decorator configuration.

```typescript
import { FORMAT } from '@midwayjs/core';
import { IProcessor, Processor } from '@midwayjs/bull';

@Processor('user', {
  repeat: {
    cron: FORMAT.CRONTAB.EVERY_MINUTE,
  },
  removeOnComplete: 3, // remove task records after success, keep up to 3 recent records
  removeOnFail: 10,   // remove task records after failure
})
export class UserService implements IProcessor {
  execute(data: any) {
    // ...
  }
}

```

Can also be configured in the global config.

```typescript
// src/config/config.default.ts
export default {
  // ...
  bull: {
    defaultQueueOptions: {
      // default job configuration
      defaultJobOptions: {
        // Keep 10 records
        removeOnComplete: 10,
      },
    },
  },
}
```





### Redis Clustering

You can use the `createClient` method provided by bull to access custom redis instances so you can access Redis clusters.

For example.

```typescript
// src/config/config.default
import Redis from 'ioredis';

const clusterOptions = {
  enableReadyCheck: false, // must be false
  retryDelayOnClusterDown: 300,
  retryDelayOnFailover: 1000,
  retryDelayOnTryAgain: 3000,
  slotsRefreshTimeout: 10000,
  maxRetriesPerRequest: null // must be null
}

const redisClientInstance = new Redis.
  Cluster([
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
      // The keys stored for these tasks all start with the same key to distinguish the user's original redis configuration
      prefix: '{midway-bull}',
    },
  }
}
```



## Queue Management

Queues are inexpensive, each Job is bound to a queue, and in some cases we can also manage queues manually by performing operations on them.



### Manual queue creation

In addition to simply defining a queue using `@Processor`, we can also create it using the API.

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

After creating a queue manually with `createQueue`, the queue will still be saved automatically. If the queue name is used by `@Processor` at startup, the already created queue is automatically used.

For example.

```typescript
// will automatically use the queue with the same name created manually above
@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(params) {
  }
}
```



### Get the queue

We can simply get the queue based on the queue name.

```typescript
 const testQueue = bullFramework.getQueue('test');
```

You can also get it through a decorator.

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



### Queue common operations

Suspend the queue.

```typescript
await testQueue.pause();
```

Continue the queue.

```typescript
await testQueue.resume();
```

Queue events.

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

See [here](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md) for the full queue API.



## Component logging

The component has its own log, which by default will be `ctx.logger` in `midway-bull.log`.

We can configure this logger object separately.

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

The output format of this log, we can also configure separately.

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

In a distributed scenario, we can leverage the Bull UI to simplify management.

Similar to the bull component, it needs to be installed and enabled independently.

```bash
$ npm i @midwayjs/bull-board@3 --save
```

Or reinstall it after adding the following dependencies to ``package.json``.

```json
{
  "dependencies": {
    "@midwayjs/bull-board": "^3.0.0",
    // ...
  },
}
```

Configure the bull-board component into the code.

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

The default access path is: `http://127.1:7001/ui`.

The effect is as follows.

![](https://img.alicdn.com/imgextra/i2/O1CN01j4wEFb1UacPxA06gs_!!6000000002534-2-tps-1932-1136.png)

The base path can be modified by configuration.

```typescript
// src/config/config.prod.ts
export default {
  // ...
  bullBoard: {
    basePath: '/ui',
  },
}
```





## Common problems

### 1. EVALSHA error

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01KfjCKT1yypmNPDkIL_!!6000000006648-2-tps-3540-102.png)

This problem is basically clear, the problem will appear on the clustered version of redis.

The reason is that redis does hash on the key to determine the storage slot, and the key of @midwayjs/bull hits a different slot in this step under the cluster.

The workaround is to include {} in the prefix configuration of the task and force redis to only calculate the hash in {}, e.g. `prefix: '{midway-task}'`.

