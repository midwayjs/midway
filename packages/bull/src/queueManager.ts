import { Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { JobOptions, Queue, QueueOptions } from 'bull';
import * as Bull from 'bull';
import { MidwayConfigService } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class BullQueueManager {
  private queueMap = new Map();

  @Inject()
  configService: MidwayConfigService;

  async execute(
    queueName: any,
    data: Record<string, any>,
    options: JobOptions = {}
  ) {
    const queue = this.queueMap[`${queueName.name}:execute`] as Queue;
    return await queue.add(data || {}, options);
  }

  public createQueue(name: string, queueOptions: QueueOptions = {}) {
    const queue = new Bull(name, queueOptions);
    this.queueMap.set(name, queue);
    return queue;
  }

  public addQueue(name: string, queue: Queue) {
    this.queueMap.set(name, queue);
    return queue;
  }

  public getQueue(name: string) {
    return this.queueMap.get(name);
  }

  public async start() {
    // loop queueMap and start job
    for (const queue of this.queueMap.values()) {
      const allJobs = await queue.getRepeatableJobs();
      if (allJobs.length > 0) {
        if (
          !(
            allJobs.length === 1 && allJobs[0].cron === rule.options.repeat.cron
          )
        ) {
          for (const item of allJobs) {
            await queue.removeRepeatableByKey(item.key);
          }
        }
      }
      queue.add({}, rule.options);
    }
  }

  public async stop() {
    // loop queueMap and stop all queue
    for (const queue of this.queueMap.values()) {
      queue.close();
    }
  }
}
