import {
  BaseFramework,
  IMidwayBootstrapOptions,
  MidwayCommonError,
  Framework,
  getClassMetadata,
  getProviderName,
  Inject,
  listModule,
  MidwayFrameworkType,
  MODULE_TASK_KEY,
  MODULE_TASK_METADATA,
  MODULE_TASK_QUEUE_KEY,
  MODULE_TASK_QUEUE_OPTIONS,
  MODULE_TASK_TASK_LOCAL_KEY,
  MODULE_TASK_TASK_LOCAL_OPTIONS,
  Utils,
  deprecatedOutput,
} from '@midwayjs/core';
import * as Bull from 'bull';
import { CronJob } from 'cron';
import { Application, Context, IQueue } from './interface';
import { QueueService } from './service/queueService';

@Framework()
export class TaskFramework extends BaseFramework<Application, Context, any> {
  queueList: any[] = [];
  jobList: any[] = [];

  @Inject()
  queueService: QueueService;

  applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
  }

  configure() {
    return this.configService.getConfiguration('task');
  }

  getFrameworkType() {
    return MidwayFrameworkType.TASK;
  }

  async run() {}

  async loadTask() {
    const legacyConfig = this.configService.getConfiguration('taskConfig');
    if (legacyConfig) {
      deprecatedOutput('[midway:task] Please use "task" replace "taskConfig"');
      this.configService.addObject({
        task: legacyConfig,
      });
    }
    const taskConfig = this.configService.getConfiguration('task');
    const modules = listModule(MODULE_TASK_KEY);
    const duplicatedCheck = new Set();

    for (const module of modules) {
      const providerName = getProviderName(module);
      if (duplicatedCheck.has(providerName)) {
        throw new MidwayCommonError(
          `Duplicate task class name "${providerName}"`
        );
      } else {
        duplicatedCheck.add(providerName);
      }
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
            await Utils.toAsyncFunction(rule.value.bind(service))(job.data);
          } catch (e) {
            logger.error(`${e.stack}`);
            throw e;
          }
          logger.info('task end.');
        });
        this.queueService.saveQueueTask(
          `${rule.name}:${rule.propertyKey}`,
          queue
        );
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
    duplicatedCheck.clear();
  }

  async loadLocalTask() {
    const taskConfig = this.configService.getConfiguration('task');
    const modules = listModule(MODULE_TASK_TASK_LOCAL_KEY);
    const duplicatedCheck = new Set();
    for (const module of modules) {
      const providerName = getProviderName(module);
      if (duplicatedCheck.has(providerName)) {
        throw new MidwayCommonError(
          `Duplicate task class name "${providerName}"`
        );
      } else {
        duplicatedCheck.add(providerName);
      }
      const rules = getClassMetadata(MODULE_TASK_TASK_LOCAL_OPTIONS, module);
      for (const rule of rules) {
        const triggerFunction = async () => {
          const requestId = Utils.randomUUID();
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
            await Utils.toAsyncFunction(rule.value.bind(service))();
          } catch (err) {
            logger.error(err);
            throw err;
          }
          logger.info('local task end.');
        };
        const job = new CronJob(
          rule.options,
          triggerFunction,
          null,
          true,
          taskConfig.defaultJobOptions.repeat.tz
        );
        job.start();
        this.queueService.saveLocalTask(
          `${module.name}:${rule.propertyKey}`,
          triggerFunction
        );
        this.jobList.push(job);
      }
    }
    duplicatedCheck.clear();
  }

  async loadQueue() {
    const modules = listModule(MODULE_TASK_QUEUE_KEY);
    const taskConfig = this.configService.getConfiguration('task');
    const config = JSON.parse(JSON.stringify(taskConfig));

    if (taskConfig && taskConfig.createClient) {
      config.createClient = taskConfig.createClient;
    }

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
          await Utils.toAsyncFunction(service.execute.bind(service))(
            job.data,
            job
          );
        } catch (e) {
          logger.error(`${e.stack}`);
          throw e;
        }
        logger.info('queue process end.');
      });
      this.queueService.saveQueue(`${rule.name}:execute`, queue);
      this.queueList.push(queue);
    }
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
