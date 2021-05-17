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
    app: IMidwayApplication
  ): Promise<void> {
    await this.loadTask();
    await this.loadLocalTask();
    await this.loadQueue(container);
  }

  async onStop() {
    this.queueList.map(queue => {
      queue.close();
    });
    this.jobList.map(job => {
      job.stop();
    });
  }

  async loadTask() {
    const modules = listModule(MODULE_TASK_KEY);
    for (const module of modules) {
      const rules = getClassMetadata(MODULE_TASK_METADATA, module);
      for (const rule of rules) {
        const queue = new Bull(
          `${rule.name}:${rule.propertyKey}`,
          this.taskConfig
        );
        queue.process(async job => {
          const ctx = this.app.createAnonymousContext();
          const service = await ctx.requestContext.getAsync(module);
          rule.value.call(service, job.data);
        });
        queue.add({}, rule.options);
        this.queueList.push(queue);
      }
    }
  }

  async loadLocalTask() {
    const modules = listModule(MODULE_TASK_TASK_LOCAL_KEY);
    for (const module of modules) {
      const rules = getClassMetadata(MODULE_TASK_TASK_LOCAL_OPTIONS, module);
      for (const rule of rules) {
        const job = new CronJob(
          rule.options,
          async () => {
            const ctx = this.app.createAnonymousContext();
            const service = await ctx.requestContext.getAsync(module);
            rule.value.call(service);
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
      const queue = new Bull(`${rule.name}:excute`, config);
      queue.process(async job => {
        const ctx = this.app.createAnonymousContext();
        const service = await ctx.requestContext.getAsync(module);
        await service.excute.call(service, job.data, job);
      });
      queueMap[`${rule.name}:excute`] = queue;
      this.queueList.push(queue);
    }
    container.registerObject('queueMap', queueMap);
  }
}
