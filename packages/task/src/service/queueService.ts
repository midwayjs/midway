import { Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { JobOptions, Queue } from 'bull';

@Provide()
@Scope(ScopeEnum.Singleton)
export class QueueService {
  @Inject('queueMap')
  queueMap;

  @Inject('queueTaskMap')
  queueTaskMap;

  async execute(queueName: any, data: any, options: JobOptions = {}) {
    const queue = this.queueMap[`${queueName.name}:execute`] as Queue;
    return await queue.add(data, options);
  }

  getClassQueue(queueName: any): Queue {
    return this.queueMap[`${queueName.name}:execute`] as Queue;
  }

  getQueueTask(queueClass: string, queueName: string): Queue {
    return this.queueTaskMap[`${queueClass}:${queueName}`] as Queue;
  }
}
