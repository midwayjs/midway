# Task queue

Queues are a powerful design pattern that helps you meet common application extension and performance challenges. Some of the problems that queues can help you solve.

Examples are as follows:

- Smoothing processing peaks. You can start resource-intensive tasks at any time and then add these tasks to the queue instead of executing them synchronously. null You can also easily add new queue consumers to extend back-end task processing.
- Decompose a single task that may block the Node.js event loop. For example, if a user requests CPU-intensive work such as audio transcoding, this task can be delegated to other processes, thus releasing user-oriented processes to maintain response.
- Provide reliable communication channels across various services. null You can be notified (by listening to status events) when you complete, error, or other status changes during the job lifecycle of any process or service. When queue producers or consumers fail, their state is preserved, and task processing can be automatically restarted when the node restarts.

Midway provides @midwayjs/Bull package as an abstraction/wrapper on [Bull](https://github.com/OptimalBits/bull). [Bull](https://github.com/OptimalBits/bull) is a popular, well-supported and high-performance implementation of Node.js-based queue system. This software package can easily integrate Bull Queues into your application in a Nest-friendly way.

Bull uses Redis to save job data. When using Redis, the Queue architecture is completely distributed and has nothing to do with the platform. For example, you can run some Queue producers and consumers in one (or more) nodes (processes) and other producers and consumers on other nodes.

This chapter introduces the @midwayjs/bull package. We also recommend reading the [Bull documentation](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md) for more background and implementation details.

:::tip

Starting from v3.6.0, the original task scheduling module `@midwayjs/task` is abandoned. if you query historical documents, please refer to [here](../legacy/task).

:::



Related information:

| Description |      |
| ----------------- | ---- |
| null | ✅ |
| Can be used for Serverless | ❌ |
| Can be used for integration | ✅ |
| Contains independent main frame | null |
| Contains independent logs | ✅ |



## Installation Components

```bash
$npm I @midwayjs/bull@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies ": {
    "@midwayjs/bull": "^3.0.0 ",
    // ...
  },
}
```



## Use components

Configure the bull component into the code.

```typescript
import { Configuration } from '@midwayjs/decorator';
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



## Some concepts

Bull divides the entire queue into three parts

- 1. Queue queue, management task
- 2. Job, each task object can start and stop the task.
- 3. Processor, task processing, actual logic execution



## Write a task processor

Use the `@Processor` decorator to decorate a class to quickly define a task processor (here we do not use Job to avoid subsequent ambiguity).

`@Processor` the decorator needs to pass the name of a Queue. When the frame starts, if there is no queue named `test`, it will be created automatically.

For example, write the following code in the `src/queue/test.queue.ts` file.

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

When starting, the framework automatically searches for and initializes the processor code, and automatically creates a queue named `test`.



## Perform tasks

After defining the Processor, we also need to execute it manually because we do not specify how the Processor will be executed.

By obtaining the corresponding queue, we can easily perform the task.



### Manually perform tasks

For example, we can execute it after the project starts.

```typescript
import { Configuration, Inject } from '@midwayjs/decorator';
import * as bull from '@midwayjs/bull';

@Configuration ({
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
    // Get Processor related queues
    const testQueue = this.bullFramework.getQueue('test');
    // Perform this task immediately
    await testQueue?.runJob();
  }
}
```



### null

We can also attach some default parameters when executing.

```typescript
@Processor('test')
null
  async execute(params) {
    // params.aaa => 1
  }
}


null
const testQueue = this.bullFramework.getQueue('test');
// Perform this task immediately
await testQueue?.runJob ({
  aaa: 1
  bbb: 2
});
```



### Task Status and Management

After you run `runJob`, you can obtain a `Job` object.

```typescript
// invoke
const testQueue = this.bullFramework.getQueue('test');
const job = await testQueue?.runJob();
```

Through this Job object, we can do progress management.

```typescript
// Update progress
await job.progress(60);
// Get progress
const progress = await job.process();
// => 60
```

Gets the task status.

```typescript
const state = await job.getState();
// state => 'delayed' delay status
// state => 'completed' completion status
```

null[](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md)



### Delayed execution

There are also some additional options when performing tasks.

For example, delay 1s execution.

```typescript
const testQueue = this.bullFramework.getQueue('test');
// Perform this task immediately
await testQueue?.runJob({}, { delay: 1000 });
```



### Middleware and Error Handling

Bull components contain Framework that can be started independently and have their own App objects and Context structures.

We can configure independent middleware and error filters for bull's App.

```typescript
@Configuration ({
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
    This. bullApp.useMiddleare( /* middleware */);
    This. bullApp.useFilter( /* filter */);
  }
}
```



### Context

Task processor execution is in the request scope, which has a special Context object structure.

```typescript
export interface Context extends IMidwayContext {
  jobId: JobId;
  job: Job
  from: new (...args) => IProcessor;
}
```

We can access the current Job object directly from ctx.

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

In addition to the delay above, there are more execution options.

| Options | Type | Description |
| ---------------- | --------------------- | ------------------------------------------------------------ |
| priority | number | Optional priority value. The range is from 1 (highest priority) to MAX_INT (lowest priority). Please note that the use priority has a slight impact on performance, so please use it with caution.  |
| delay | number | The amount of time (in milliseconds) to wait for this job to be processed. Please note that in order to obtain accurate delay, both the server and the client should synchronize their clocks.  |
| attempts | number | The total number of attempts before the task is completed.  |
| repeat | RepeatOpts | According to the repeated task configuration of cron specification, you can view more [RepeatOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd) and the following introduction of repeated tasks.  |
| backoff | number \| BackoffOpts | Rollback setting for automatic retry when a task fails. See [BackoffOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd).  |
| lifo | boolean | If true, the task is added to the right end of the queue instead of the left end (false by default).  |
| timeout | number | The number of milliseconds in which the task failed due to a timeout error.  |
| jobId | number \| string | Overwrite task id-By default, the task id is a unique integer, but you can override it with this setting. If you use this option, it is up to you to ensure that jobId is unique. If you try to add a task with an id that already exists, it will not be added.  |
| removeOnComplete | boolean \| number | If true, the task is deleted after successful completion. If you set a number, specify the number of tasks to keep. The default behavior is that task information remains in the completed list.  |
| removeOnFail | boolean \| number | If true, the task is deleted when all attempts fail. If you set a number, specify the number of tasks to keep. The default behavior is to keep task information in the failure list.  |
| stackTraceLimit | number | Limit the number of stack trace rows that will be recorded in the stack trace.  |



## Repeated tasks

In addition to manual execution, we can also quickly configure the repeated execution of tasks by `@Processor` the parameters of the decorator.

```typescript
import { Processor, IProcessor } from '@midwayjs/bull';
import { FORMAT } from '@midwayjs/decorator';

null
  null
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

Regarding Cron expressions, the format is as follows.

```typescript
* * * * * *
│
│ │ │ │ │ │ │ |
│ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
│ │ │ │ └───── month (1 - 12)
│ │ │ └────────── day of month (1 - 31)
│ │ └─────────────── hour (0 - 23)
│ └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```



Common expressions:

- run every 5 seconds: `*/5 * * * *`
- run every 1 minute: `0 */1 * * *`
- run every 20 minutes per hour: `0 20 * * *`
- run every day at 0 o'clock: `0 0 0 * *`
- Execute every day at 2:35: `0 35 2 * *`

You can use the [online tool](https://cron.qqe2.com/) to confirm the time of the next execution.

Midway provides some commonly used expressions on the frame side for everyone to use in `@midwayjs/decorator`.

```typescript
import { FORMAT } from '@midwayjs/decorator';

// cron expressions executed per minute
FORMAT.CRONTAB.EVERY_MINUTE
```



There are some other expressions built in.

| Expression | corresponding time |
| ------------------------------ | --------------- |
| CRONTAB.EVERY_SECOND | Every second |
| CRONTAB.EVERY_MINUTE | Every minute |
| CRONTAB.EVERY_HOUR | Every hour on the hour |
| CRONTAB.EVERY_DAY | 0 o'clock every day |
| CRONTAB.EVERY_DAY_ZERO_FIFTEEN | At 0:15 every day |
| null | At 1: 15 every day |
| CRONTAB.EVERY_PER_5_SECOND | Every 5 seconds |
| CRONTAB.EVERY_PER_10_SECOND | Every 10 seconds |
| CRONTAB.EVERY_PER_30_SECOND | Every 30 seconds |
| CRONTAB.EVERY_PER_5_MINUTE | Every 5 minutes |
| CRONTAB.EVERY_PER_10_MINUTE | Every 10 minutes |
| CRONTAB.EVERY_PER_30_MINUTE | Every 30 minutes |



## Distributed task

In the above code, we all run on each process of each machine. If you need distributed tasks (each task is executed only once in a specific process), you need to configure Redis.



### Configure distributed tasks

Configure in the `config.default.ts` file.

```typescript
// src/config/config.default.ts
export default {
  // ...
  bull: {
    // Default queue configuration
    null
      redis: 'redis://127.0.0.1:32768 ',
      // The keys stored in these tasks start with midway-task to distinguish the configurations in the user's original redis.
      prefix: 'midway-bull ',
    }
  },
}
```

Account password:

```typescript
// src/config/config.default.ts
export default {
  null
  bull: {
    null
      redis: {
        port: 6379
        host: '127.0.0.1 ',
        password: 'foobared ',
      },
      prefix: 'midway-bull ',
    }
  null
}
```

null



### Clean up previous tasks

By default, the framework automatically clears the **duplicate execution tasks** that were not scheduled for the previous time, keeping the queue of the duplicate execution tasks up to date. If cleaning is not required in some environments, it can be shut down separately.

For example, you don't need to clean up repetitions:

```typescript
// src/config/config.prod.ts
export default {
  // ...
  bull: {
    clearRepeatJobWhenStart: false
  },
}
```

:::tip

If it is not cleaned up, if the previous queue was executed for 10s and is now changed to 20s, both timings will be stored in Redis, causing the code to execute repeatedly.

In daily development, if you don't clean up, it is easy to have the problem of code repeated execution. However, in the cluster deployment scenario, when multiple servers restart in turn, scheduled tasks may be accidentally cleaned up. Please evaluate the timing of the switch.

:::



You can also manually clean up all tasks at startup.

```typescript
// src/configuration.ts
import { Configuration, App, Inject } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { join } from 'path';
import * as bull from '@midwayjs/bull';

@Configuration ({
  imports: [koa, bull]
  importConfigs: [join(__dirname, './config')]
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  @Inject()
  bullFramework: bull.Framework;

  async onReady() {
    // At this stage, the decorator queue has not been created yet. Use API to manually create the queue in advance, and the decorator will reuse the queue with the same name.
    const queue = this.bullFramework.createQueue('user');
    // Manually perform cleanup through the queue
    await queue.obliterate({ force: true });
  }
}
```





### Clean up task history

When Redis is turned on, by default, bull will record all successful and failed task keys, which may cause the key of redis to skyrocket. We can configure the option of cleaning up after success or failure.

By default

- There are 3 task records kept when successful.
- Failed to retain 10 task records

It can also be configured by parameters.

For example, in the decorator configuration.

```typescript
import { FORMAT } from '@midwayjs/decorator';
import { IProcessor, Processor } from '@midwayjs/bull';

@Processor('user ', {
  repeat: {
    cron: FORMAT.CRONTAB.EVERY_MINUTE
  },
  removeOnComplete: 3, // Remove the task record after success, and keep the latest 3 records at most
  null
})
export class UserService implements IProcessor {
  execute(data: any) {
    // ...
  }
}

```

You can also configure it in global config.

```typescript
// src/config/config.default.ts
export default {
  // ...
  bull: {
    // Default task configuration
    defaultJobOptions: {
      // Keep 10 records
      removeOnComplete: 10
    }
  },
}
```





### Redis cluster

You can use the `createClient` method provided by bull to access a custom redis instance, so that you can access the Redis cluster.

For example:

```typescript
// src/config/config.default
import Redis from 'ioredis';

const clusterOptions = {
  enableReadyCheck: false, // must be false
  retryDelayOnClusterDown: 300
  retryDelayOnFailover: 1000
  retryDelayOnTryAgain: 3000
  slotsRefreshTimeout: 10000
  maxRetriesPerRequest: null // must be null
}

const redisClientInstance = new Redis.Cluster ([
  {
    null
    host: '127.0.0.1'
  },
  {
    port: 7002
    host: '127.0.0.1'
  },
], clusterOptions);

export default {
  bull: {
    defaultQueueOptions: {
      null
        return redisClientInstance;
      },
      // The keys stored in these tasks are all at the same beginning, so as to distinguish the configurations in the user's original redis.
    	prefix: '{midway-bull} ',
    },
  }
}
```



## Queue management

Queues are cheap. Each Job will bind a queue. In some cases, we can also manage the queue manually.



### Create queue manually

In addition to simply defining queues using the `@Processor`, we can also create them using the API.

```typescript
import { Configuration, Inject } from '@midwayjs/decorator';
import * as bull from '@midwayjs/bull';

@Configuration ({
  imports: [
    // ...
    bull
  ]
})
export class MainConfiguration {

  @Inject()
  bullFramework: bull.Framework;

  async onReady() {
    const testQueue = bullFramework.createQueue('test ', {
      redis: {
        port: 6379
        host: '127.0.0.1 ',
        password: 'foobared ',
      },
      prefix: '{midway-bull} ',
    });

    // ...
  }
}
```

After the queue is manually created by `createQueue`, the queue will still be saved automatically. If the `@Processor` uses the queue name at startup, the created queue will be automatically used.

For example:

```typescript
// The queue with the same name created manually above will be used automatically.
@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(params) {
  }
}
```



### Get queue

We can simply get the queue based on the queue name.

```typescript
 const testQueue = bullFramework.getQueue('test');
```

It can also be obtained through the decorator.

```typescript
import { InjectQueue, IQueue } from '@midwayjs/bull';
null

@Provide()
export class UserService {
  @InjectQueue('test')
  testQueue: IQueue;

  null
    await this.testQueue.pause();
    // ...
  }
null
```



### Common queue operations

null

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
  console.log('Job ${job.id} is ${progress * 100}% ready!');
});

testQueue.on('completed', function (job, result) {
  console.log('Job ${job.id} completed! Result: ${result}');
  job.remove();
});
```

For more information about the full queue API, see [here](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md).



## Component log

The widget has its own logs. By default, `ctx.logger` is recorded in `midway-bull.log`.

We can configure this logger object separately.

```typescript
export default {
  midwayLogger: {
    // ...
    bullLogger: {
      fileLogName: 'midway-bull.log ',
    },
  }
}
```

The output format of this log can also be configured separately.

```typescript
export default {
  bull: {
    // ...
    contextLoggerFormat: info => {
      const { jobId, from } = info.ctx;
      return '${info.timestamp} ${info.LEVEL} ${info.pid} [${jobId} ${from.name}] ${info.message}';
    },
  }
}
```



## Bull UI

In distributed scenarios, we can use Bull UI to simplify management.

Similar to bull components, it needs to be installed and enabled independently.

```bash
$npm I @midwayjs/bull-board@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies ": {
    "@midwayjs/bull-board": "^3.0.0 ",
    // ...
  },
}
```

Configure the bull-board component into the code.

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as bull from '@midwayjs/bull';
import * as bullBoard from '@midwayjs/bull-board';

@Configuration ({
  imports: [
    // ...
    bull
    bullBoard
  ]
})
export class MainConfiguration {
  //...
null
```

The default access path is `http:// 127.1:7001/ui`.

The effect is as follows:

![](https://img.alicdn.com/imgextra/i2/O1CN01j4wEFb1UacPxA06gs_!!6000000002534-2-tps-1932-1136.png)

The underlying path can be modified through configuration.

```typescript
null
export default {
  // ...
  null
    basePath: '/ui ',
  },
}
```





## Frequently Asked Questions

### 1. EVALSHA error

![image.png](https://img.alicdn.com/imgextra/i4/O1CN01KfjCKT1yypmNPDkIL_!!6000000006648-2-tps-3540-102.png)

This problem is basically clear. The problem will appear on the cluster version of redis.

The reason is that redis will hash the key to determine the stored slot. In this step of the cluster, the key @midwayjs/bull hit a different slot.

The solution is to use the prefix configuration in the task to include {}, and force redis to calculate only the hash in {}, for example, `prefix: '{midway-task}'`.

