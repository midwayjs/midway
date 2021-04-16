import { Inject, Provide } from '@midwayjs/decorator';
import { JobOptions, Queue } from 'bull';

@Provide()
export class QueueService {
  @Inject('queueMap')
  queueMap;

  async excute(queueName: any, data: any, options: JobOptions) {
    const queue = this.queueMap[
      `${queueName.constructor.name}:excute`
    ] as Queue;
    return await queue.add(data, options);
  }

  getClassQueue(queueName: any): Queue {
    return this.queueMap[`${queueName.constructor.name}:excute`] as Queue;
  }
}
