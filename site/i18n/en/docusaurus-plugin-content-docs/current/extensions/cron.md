# Local task

Unlike the bull component, the cron component provides local task capabilities, that is, every process on every machine will execute. If you need to execute tasks only once between different machines or different processes, please use [bull component](./bull) .



Related Information:

| Description                     |      |
| ------------------------------- | ---- |
| Available for Standard Items    | ✅    |
| Available for Serverless        | ❌    |
| Can be used for integration     | ✅    |
| Contains independent main frame | ✅    |
| Contains standalone logs        | ✅    |



## Install components

```bash
$ npm i @midwayjs/cron@3 --save
```

Or add the following dependencies in `package.json` and reinstall.

```json
{
   "dependencies": {
     "@midwayjs/cron": "^3.0.0",
     //...
   },
}
```



## Using components

Configure components into code.

```typescript
import { Configuration } from '@midwayjs/core';
import * as cron from '@midwayjs/cron';

@Configuration({
   imports: [
     //...
     cron
   ]
})
export class MainConfiguration {
   //...
}
```



## Write task processing class

Decorate a class with the `@Job` decorator to quickly define a job handler.

For example, create a `sync.job.ts` in the `src/job` directory for some data synchronization tasks, the code is as follows:

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
     //...
   }
}
```

The `@Job` decorator is used to decorate a task class, and the framework will automatically convert it into a task when it is initialized.

The task class needs to implement the `IJob` interface and implement the `onTick` method. Whenever the task is triggered, the `onTick` method will be called automatically.

Additionally, there is an optional `onComplete` method to be executed after `onTick` has completed.

```typescript
@Job({
   cronTime: FORMAT.CRONTAB.EVERY_PER_30_MINUTE,
   start: true,
})
export class DataSyncCheckerJob implements IJob {
   async onTick() {
     //...
   }
  
   async onComplete() {
     // Record some data, etc., not very useful
   }
}
```



Common parameters of the `@Job` decorator are as follows:

| Parameter | Type    | Description                               |
| --------- | ------- | ----------------------------------------- |
| cronTime  | string  | crontab expression                        |
| start     | boolean | Whether to automatically start the task   |
| runOnInit | boolean | Whether to execute once at initialization |

For more parameters, please refer to [Cron](https://github.com/kelektiv/node-cron).



## Task Management

In addition to timing tasks, we also manually manage tasks through the API provided by the framework.

For example, the following code only defines a task, but does not start execution.

```typescript
@Job('syncJob', {
   cronTime: '*/2 * * * * *', // execute every 2s
})
export class DataSyncCheckerJob implements IJob {
   async onTick() {
     //...
   }
}
```

We define a job called `syncJob` and give it a default schedule.



### Get task object

We can get the task object in two ways.

It is used to inject a task through `@InjectJob`, and the parameter is the class itself or the task name.

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
     // this.syncJob === this.syncJob2
   }
}

```

Obtained through the Framework API.

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
    
     // syncJob === syncJob2
   }
}

```

:::caution

Note that the task object must be obtained after the `onServerReady` life cycle or startup.

:::



### Start and stop tasks

We can start this task after initialization or after some program execution is completed.

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
    
     //...
     this.syncJob.stop();
   }
}

```



## context

Task execution is in request scope, which has a special Context object structure.

```typescript
export interface Context extends IMidwayContext {
   job: CronJob;
}
```

The `CronJob` type here comes from the `node-cron` package.



## Component log

By default, the `ctx.logger` will be recorded in `midway-cron.log`.

We can configure this logger object individually.

```typescript
export default {
   midwayLogger: {
     //...
     clients: {
       //...
       cronLogger: {
         fileLogName: 'midway-cron.log',
       },
     }
   }
}
```