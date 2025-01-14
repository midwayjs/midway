# Task Queue

Queue is a powerful design pattern that can help you handle common application scaling and performance challenges. Here are some problems that queues can help you solve:

- Smooth out processing peaks. You can start resource-intensive tasks at any time, add them to a queue instead of executing them synchronously. Let task processes pull tasks from the queue in a controlled manner. You can also easily add new queue consumers to scale backend task processing.
- Break down single tasks that might block the Node.js event loop. For example, if a user request requires CPU-intensive work like audio transcoding, you can delegate this task to other processes, freeing up user-facing processes to remain responsive.
- Provide reliable communication channels across various services. For example, you can queue tasks (jobs) in one process or service and consume them in another. You can receive notifications (by listening to status events) when jobs complete, fail, or undergo other status changes in any process or service's job lifecycle. When queue producers or consumers fail, their state is preserved, and task processing can automatically restart when nodes restart.

Midway provides the @midwayjs/bullmq package as an abstraction/wrapper on top of [BullMQ](https://github.com/taskforcesh/bullmq). BullMQ is the next-generation implementation of Bull, offering better performance and more features. This package makes it easy to integrate BullMQ into your application in a friendly way.

BullMQ uses Redis to store job data. When using Redis, the Queue architecture is completely distributed and platform-independent. For example, you can run some Queue producers and consumers in one (or more) nodes (processes) while running other producers and consumers on other nodes.

:::tip
bullmq is a distributed task management system that requires redis
:::

:::caution
Since BullMQ is a successor to Bull, starting with v3.20, it will replace the Bull component. If you need to use the Bull component, please refer to the [Bull documentation](./bull).
:::

Related Information:

| Description              |      |
| ----------------------- | ---- |
| Available for standard projects | ✅    |
| Available for Serverless | ❌    |
| Available for Integration | ✅    |
| Contains independent main framework | ✅    |
| Contains independent logs | ✅    |


## Installation

```bash
$ npm i @midwayjs/bullmq@3 --save
```

Or add the following dependency to your `package.json` and reinstall.

```json
{
  "dependencies": {
    "@midwayjs/bullmq": "^3.0.0",
    // ...
  },
}
```

## Using the Component

Configure the bullmq component in your code.

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

## Core Concepts

BullMQ divides the entire queue system into the following parts:

- Queue: Manages tasks
- Job: Each task object that can be controlled (start/stop)
- Worker: Task processor that executes the actual logic
- QueueEvents: Queue events for monitoring task status changes
- FlowProducer: Task flow producer for creating task dependencies

## Basic Configuration

bullmq is a distributed task manager that heavily depends on redis. Configure it in the `config.default.ts` file.

```typescript
// src/config/config.default.ts
export default {
  // ...
  bullmq: {
    defaultConnection: {
      host: '127.0.0.1',
      port: 6379,
    },
    // Optional, queue prefix
    defaultPrefix: '{midway-bullmq}',
  },
}
```

With username and password:

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

All queues, processors, queue events, and flow producers will reuse this configuration.

## Writing Task Processors

Use the `@Processor` decorator to quickly define a task processor.

The `@Processor` decorator requires a Queue name. If a queue with the specified name doesn't exist when the framework starts, it will be automatically created.

For example, write the following code in `src/processor/test.processor.ts`:

```typescript
import { Processor, IProcessor } from '@midwayjs/bullmq';

@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(data: any) {
    // Process task logic
    console.log('processing job:', data);
  }
}
```

## Executing Tasks

After defining a Processor, since we haven't specified how to execute it, we need to run it manually.

### Manual Execution

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
    // Get the queue associated with the Processor
    const testQueue = this.bullmqFramework.getQueue('test');
    // Execute the task immediately
    await testQueue?.runJob();
  }
}
```

### Adding Execution Parameters

We can attach additional parameters when executing tasks.

```typescript
@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(params) {
    // params.name => 'harry'
  }
}

// invoke
const testQueue = this.bullmqFramework.getQueue('test');
await testQueue?.runJob({
  name: 'harry'
});
```

### Task Status and Management

After executing `runJob`, we get a `Job` object.

```typescript
const testQueue = this.bullmqFramework.getQueue('test');
const job = await testQueue?.runJob();

// Update progress
await job.updateProgress(60);
// Get progress
const progress = await job.progress;
// => 60

// Get task status
const state = await job.getState();
// state => 'delayed'
// state => 'completed'
// state => 'failed'
```

### Delayed Execution

Tasks can be executed with additional options.

For example, to delay execution by 1 second:

```typescript
const testQueue = this.bullmqFramework.getQueue('test');
await testQueue?.runJob({}, { delay: 1000 });
```

### Task Retry

BullMQ supports task failure retry mechanism.

```typescript
const testQueue = this.bullmqFramework.getQueue('test');
await testQueue?.runJob({}, {
  attempts: 3,  // Maximum 3 retry attempts
  backoff: {    // Retry strategy
    type: 'exponential',  // Exponential backoff
    delay: 1000          // Initial delay of 1 second
  }
});
```

### Task Priority

Tasks can be assigned priorities, with higher priority tasks executing first.

```typescript
const testQueue = this.bullmqFramework.getQueue('test');
// Higher priority value means higher priority
await testQueue?.runJob({ priority: 1 }, { priority: 3 }); // High priority
await testQueue?.runJob({ priority: 2 }, { priority: 2 }); // Medium priority
await testQueue?.runJob({ priority: 3 }, { priority: 1 }); // Low priority
```

### Middleware and Error Handling

The BullMQ component includes an independently startable Framework with its own App object and Context structure.

We can configure independent middleware and error filters for the bullmq App.

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
    this.bullmqApp.useMiddleware(/*middleware*/);
    this.bullmqApp.useFilter(/*filter*/);
  }
}
```

### Context

Task processors execute in request scope and have a special Context object structure.

```typescript
export interface Context extends IMidwayContext {
  jobId: string;
  job: Job;
  token?: string;
  from: new (...args) => IProcessor;
}
```

We can access the current Job object directly from ctx.

```typescript
import { Processor, IProcessor, Context } from '@midwayjs/bullmq';

@Processor('test')
export class TestProcessor implements IProcessor {
  @Inject()
  ctx: Context;

  async execute(data: any) {
    // ctx.jobId => current task ID
    // ctx.job => current job object
  }
}
```

## Repeatable Tasks

Besides manual execution, we can quickly configure repeatable task execution through the `@Processor` decorator parameters.

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
    // Executes every 5 seconds
  }
}
```

## Advanced Features

### Task Flow (Flow Producer)

BullMQ supports creating task dependencies to form task flows.

```typescript
const flowProducer = bullmqFramework.createFlowProducer({}, 'test-flow');

// Create task flow
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

### Queue Events

BullMQ provides a rich event system for monitoring various task status changes.

```typescript
const eventQueue = bullmqFramework.createQueue('event-queue');
const queueEvents = eventQueue.createQueueEvents();

// Listen for task completion
queueEvents.on('completed', ({ jobId }) => {
  console.log(`Job ${jobId} completed!`);
});

// Listen for task failure
queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.log(`Job ${jobId} failed: ${failedReason}`);
});
```

### Cleaning Task History

When Redis is enabled, bullmq records all successful and failed task keys by default, which may cause Redis keys to grow rapidly. We can configure cleanup options for successful or failed tasks.

```typescript
// src/config/config.default.ts
export default {
  bullmq: {
    defaultQueueOptions: {
      defaultJobOptions: {
        removeOnComplete: 3,  // Keep only the last 3 records after success
        removeOnFail: 10,     // Keep only the last 10 records after failure
      }
    }
  }
}
```

### Redis Cluster

bullmq allows you to specify a connection instance. You can configure your own Redis instance in `defaultConnection` to connect to a Redis cluster.

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

## Component Logging

The component has its own logs, by default recording `ctx.logger` in `midway-bullmq.log`.

We can configure this logger object separately.

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

We can also configure the log output format separately.

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

## BullMQ Original Objects

The component exports the original BullMQ objects, which can be used for more operations.

```typescript
import { BullMQ } from '@midwayjs/bullmq';
```

Through the `BullMQ` object, you can access object definitions such as `Queue`, `Worker`, `FlowProducer`, etc.

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

In addition, the component provides the `BullBoardManager` class, which can add queues dynamically created.

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

  async onReady() {
    const testQueue = this.bullmqFramework.createQueue('test', {
      // ...
    });

    this.bullBoardManager.addQueue(testQueue);
  }
}
```