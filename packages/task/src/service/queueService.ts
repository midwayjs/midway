import { Inject, Provide } from '@midwayjs/decorator';
import { JobOptions, Queue } from 'bull';

@Provide()
export class QueueService {
  @Inject('queueMap')
  queueMap;

  @Inject('queueTaskMap')
  queueTaskMap;

  @Inject("localTaskMap")
  localTaskMap;

  /**
   * @deprecated please use execute method
   */
  async excute(queueName: any, data: any, options: JobOptions = {}) {
    return this.execute(queueName, data, options);
  }

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

  getLocalTask(queueClass: string, queueName: string): Function{
    return this.localTaskMap[`${queueClass}:${queueName}`] as Function;
  }
}
