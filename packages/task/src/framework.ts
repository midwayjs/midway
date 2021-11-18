import { BaseFramework, IMidwayBootstrapOptions } from '@midwayjs/core';
import {
  Framework,
  getClassMetadata,
  isAsyncFunction,
  listModule,
  MidwayFrameworkType,
  MODULE_TASK_KEY,
  MODULE_TASK_METADATA,
  MODULE_TASK_QUEUE_KEY,
  MODULE_TASK_QUEUE_OPTIONS,
  MODULE_TASK_TASK_LOCAL_KEY,
  MODULE_TASK_TASK_LOCAL_OPTIONS,
} from '@midwayjs/decorator';
import * as Bull from 'bull';
import { CronJob } from 'cron';
import { v4 } from 'uuid';
import { Application, Context, IQueue } from './interface';
import { deprecatedOutput } from '@midwayjs/core';

function wrapAsync(fn) {
  return async function (...args) {
    if (isAsyncFunction(fn)) {
      await fn.call(...args);
    } else {
      const result = fn.call(...args);
      if (result && result.then) {
        await result;
      }
    }
  };
}

@Framework()
export class TaskFramework extends BaseFramework<Application, Context, any> {
  queueList: any[] = [];
  jobList: any[] = [];

  applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
  }

  configure() {
    return this.configService.getConfiguration('task');
  }

  getFrameworkType() {
    return MidwayFrameworkType.TASK;
  }

  async run() {
    await this.loadTask();
    await this.loadLocalTask();
    await this.loadQueue();
  }

  async loadTask() {
    const legacyConfig = this.configService.getConfiguration('taskConfig');
    if (legacyConfig) {
      deprecatedOutput('[task]: Please use "task" replace "taskConfig"');
      this.configService.addObject({
        task: legacyConfig,
      });
    }
    const taskConfig = this.configService.getConfiguration('task');
    const modules = listModule(MODULE_TASK_KEY);
    const queueTaskMap = {};
    for (const module of modules) {
      const rules = getClassMetadata(MODULE_TASK_METADATA, module);
      for (const rule of rules) {
        const queue = new Bull(`${rule.name}:${rule.propertyKey}`, taskConfig);
        queue.process(async job => {
          const ctx = this.app.createAnonymousContext({
            taskInfo: {
              type: 'Task',
              id: job.id,
              trigger: `${rule.name}:${rule.propertyKey}`,
            },
          });
          const { logger } = ctx;
          try {
            logger.info('task start.');
            const service = await ctx.requestContext.getAsync(module);
            await wrapAsync(rule.value)(service, job.data);
          } catch (e) {
            logger.error(`${e.stack}`);
          }
          logger.info('task end.');
        });
        queueTaskMap[`${rule.name}:${rule.propertyKey}`] = queue;
        const allJobs = await queue.getRepeatableJobs();
        if (allJobs.length > 0) {
          if (
            !(
              allJobs.length === 1 &&
              allJobs[0].cron === rule.options.repeat.cron
            )
          ) {
            for (const item of allJobs) {
              await queue.removeRepeatableByKey(item.key);
            }
          }
        }
        queue.add({}, rule.options);
        this.queueList.push(queue);
      }
    }
    this.applicationContext.registerObject('queueTaskMap', queueTaskMap);
  }

  async loadLocalTask() {
    const taskConfig = this.configService.getConfiguration('taskConfig');
    const modules = listModule(MODULE_TASK_TASK_LOCAL_KEY);
    for (const module of modules) {
      const rules = getClassMetadata(MODULE_TASK_TASK_LOCAL_OPTIONS, module);
      for (const rule of rules) {
        const job = new CronJob(
          rule.options,
          async () => {
            const requestId = v4();
            const ctx = this.app.createAnonymousContext({
              taskInfo: {
                type: 'LocalTask',
                id: requestId,
                trigger: `${module.name}:${rule.propertyKey}`,
              },
            });
            const { logger } = ctx;
            try {
              const service = await ctx.requestContext.getAsync(module);
              logger.info('local task start.');
              await wrapAsync(rule.value)(service);
            } catch (e) {
              logger.error(`${e.stack}`);
            }
            logger.info('local task end.');
          },
          null,
          true,
          taskConfig.defaultJobOptions.repeat.tz
        );
        job.start();
        this.jobList.push(job);
      }
    }
  }

  async loadQueue() {
    const modules = listModule(MODULE_TASK_QUEUE_KEY);
    const queueMap = {};
    const taskConfig = this.configService.getConfiguration('taskConfig');
    const config = JSON.parse(JSON.stringify(taskConfig));
    const concurrency = config.concurrency || 1;
    delete config.defaultJobOptions.repeat;
    for (const module of modules) {
      const rule = getClassMetadata(MODULE_TASK_QUEUE_OPTIONS, module);
      const queue = new Bull(`${rule.name}:execute`, config);
      queue.process(concurrency, async job => {
        const ctx = this.app.createAnonymousContext({
          taskInfo: {
            type: 'Queue',
            id: job.id,
            trigger: `${module.name}`,
          },
        });
        const { logger } = ctx;
        try {
          logger.info('queue process start.');
          const service = await ctx.requestContext.getAsync<IQueue>(module);
          await wrapAsync(service.execute)(service, job.data, job);
        } catch (e) {
          logger.error(`${e.stack}`);
        }
        logger.info('queue process end.');
      });
      queueMap[`${rule.name}:execute`] = queue;
      this.queueList.push(queue);
    }
    this.applicationContext.registerObject('queueMap', queueMap);
  }

  protected async beforeStop() {
    this.queueList.map(queue => {
      queue.close();
    });
    this.jobList.map(job => {
      job.stop();
    });
  }
}
