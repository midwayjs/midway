// src/configuration.ts
import {
  App,
  Config,
  Configuration,
  getClassMetadata,
  listModule,
} from '@midwayjs/decorator';
import { join } from 'path';
import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core';
import {
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
import { ScheduleContextLogger } from './service/scheduleContextLogger';

function isAsync(fn) {
  return fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(fn) {
  return async function (...args) {
    if (isAsync(fn)) {
      await fn.call(...args);
    } else {
      const result = fn.call(...args);
      if (result && result.then) {
        await result;
      }
    }
  };
}

@Configuration({
  namespace: 'task',
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  @App()
  app;

  @Config('taskConfig')
  taskConfig;

  queueList: any[] = [];
  jobList: any[] = [];

  async onReady(
    container: IMidwayContainer,
    _: IMidwayApplication
  ): Promise<void> {
    this.createLogger();
    await this.loadTask(container);
    await this.loadLocalTask();
    await this.loadQueue(container);
  }

  createLogger() {
    this.app.createLogger('midway-task', {
      fileLogName: 'midway-task.log',
      errorLogName: 'midway-task-error.log',
      printFormat: info => {
        return `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.label} ${info.message}`;
      },
    });
  }

  async onStop() {
    this.queueList.map(queue => {
      queue.close();
    });
    this.jobList.map(job => {
      job.stop();
    });
  }

  getContext(options: { type: string; id: any; trigger: string }) {
    const ctx = this.app.createAnonymousContext({ logger: console });
    ctx.logger = new ScheduleContextLogger(
      ctx,
      this.app.getLogger('midway-task')
    );
    ctx.requestContext.registerObject('logger', ctx.logger);
    ctx.taskInfo = options;
    return ctx;
  }

  async loadTask(container) {
    const modules = listModule(MODULE_TASK_KEY);
    const queueTaskMap = {};
    for (const module of modules) {
      const rules = getClassMetadata(MODULE_TASK_METADATA, module);
      for (const rule of rules) {
        const queue = new Bull(
          `${rule.name}:${rule.propertyKey}`,
          this.taskConfig
        );
        queue.process(async job => {
          const ctx = this.getContext({
            type: 'Task',
            id: job.id,
            trigger: `${rule.name}:${rule.propertyKey}`,
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
    container.registerObject('queueTaskMap', queueTaskMap);
  }

  async loadLocalTask() {
    const modules = listModule(MODULE_TASK_TASK_LOCAL_KEY);
    for (const module of modules) {
      const rules = getClassMetadata(MODULE_TASK_TASK_LOCAL_OPTIONS, module);
      for (const rule of rules) {
        const job = new CronJob(
          rule.options,
          async () => {
            const requestId = v4();
            const ctx = this.getContext({
              type: 'LocalTask',
              id: requestId,
              trigger: `${module.name}:${rule.propertyKey}`,
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
          this.taskConfig.defaultJobOptions.repeat.tz
        );
        job.start();
        this.jobList.push(job);
      }
    }
  }

  async loadQueue(container) {
    const modules = listModule(MODULE_TASK_QUEUE_KEY);
    const queueMap = {};
    const config = JSON.parse(JSON.stringify(this.taskConfig));
    delete config.defaultJobOptions.repeat;
    for (const module of modules) {
      const rule = getClassMetadata(MODULE_TASK_QUEUE_OPTIONS, module);
      const queue = new Bull(`${rule.name}:execute`, config);
      const concurrency = config.concurrency || 1;
      queue.process(concurrency || 1, async job => {
        const ctx = this.getContext({
          type: 'Queue',
          id: job.id,
          trigger: `${module.name}`,
        });
        const { logger } = ctx;
        try {
          logger.info('queue process start.');
          const service = await ctx.requestContext.getAsync(module);
          await wrapAsync(service.execute)(service, job.data, job);
        } catch (e) {
          logger.error(`${e.stack}`);
        }
        logger.info('queue process end.');
      });
      queueMap[`${rule.name}:execute`] = queue;
      this.queueList.push(queue);
    }
    container.registerObject('queueMap', queueMap);
  }
}
