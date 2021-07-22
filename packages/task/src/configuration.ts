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

function isAsync(fn) {
  return fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(fn){
  return async function (...args){
    if(isAsync(fn)){
      await fn.call(...args);
    }else{
      let result = fn.call(...args);
      if(result && result.then){
        await result;
      }
    }
  }
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
    app: IMidwayApplication
  ): Promise<void> {
    this.createLogger();
    await this.loadTask(container);
    await this.loadLocalTask();
    await this.loadQueue(container);
  }

  createLogger(){
    this.app.createLogger('midway-task', {
      fileLogName: 'midway-task.log',
      errorLogName: 'midway-task-error.log',
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
          this.app.getLogger('midway-task').info(`[Task][${job.id}][${rule.name}:${rule.propertyKey}] task start.`)
          try{
            const ctx = this.app.createAnonymousContext();
            ctx.traceId = job.id;
            const service = await ctx.requestContext.getAsync(module);
            await wrapAsync(rule.value)(service, job.data);
          }catch(e){
            this.app.getLogger('midway-task').error(`[Task][${job.id}][${rule.name}:${rule.propertyKey}] ${e.stack}`)
          }
          this.app.getLogger('midway-task').info(`[Task][${job.id}][${rule.name}:${rule.propertyKey}] task end.`)
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
            this.app.getLogger('midway-task').info(`[LocalTask][${requestId}][${module.name}] local task start.`)
            try{
              const ctx = this.app.createAnonymousContext();
              ctx.traceId = requestId;
              const service = await ctx.requestContext.getAsync(module);
              await wrapAsync(rule.value)(service);
            }catch(e){
              this.app.getLogger('midway-task').error(`[LocalTask][${requestId}][${module.name}] ${e.stack}`)
            }
            this.app.getLogger('midway-task').info(`[LocalTask][${requestId}][${module.name}] local task end.`)
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
      queue.process(async job => {
        this.app.getLogger('midway-task').info(`[Queue][${job.id}][${module.name}] queue process start.`)
        try{
          const ctx = this.app.createAnonymousContext();
          ctx.traceId = job.id;
          const service = await ctx.requestContext.getAsync(module);
          await wrapAsync(service.execute)(service, job.data, job);
        }catch(e){
          this.app.getLogger('midway-task').error(`[Queue][${job.id}][${module.name}] ${e.stack}`)
        }
        this.app.getLogger('midway-task').info(`[Queue][${job.id}][${module.name}] queue process end.`)
      });
      queueMap[`${rule.name}:execute`] = queue;
      this.queueList.push(queue);
    }
    container.registerObject('queueMap', queueMap);
  }
}
