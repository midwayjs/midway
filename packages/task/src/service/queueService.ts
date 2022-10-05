import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { JobOptions, Queue } from 'bull';

@Provide()
@Scope(ScopeEnum.Singleton)
export class QueueService {
  private queueMap = {};
  private queueTaskMap = {};
  private localTaskMap = {};

  async execute(
    queueName: any,
    data: Record<string, any>,
    options: JobOptions = {}
  ) {
    const queue = this.queueMap[`${queueName.name}:execute`] as Queue;
    return await queue.add(data || {}, options);
  }

  getClassQueue(queueName: any): Queue {
    return this.queueMap[`${queueName.name}:execute`] as Queue;
  }

  getQueueTask(queueClass: string, queueName: string): Queue {
    return this.queueTaskMap[`${queueClass}:${queueName}`] as Queue;
  }

  getLocalTask(queueClass: string, queueName: string): any {
    return this.localTaskMap[`${queueClass}:${queueName}`] as any;
  }

  saveQueue(key, value) {
    this.queueMap[key] = value;
  }

  saveQueueTask(key, value) {
    this.queueTaskMap[key] = value;
  }

  saveLocalTask(key, value) {
    this.localTaskMap[key] = value;
  }
}
