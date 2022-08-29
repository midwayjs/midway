import { BaseFramework, IMidwayBootstrapOptions } from '@midwayjs/core';
import {
  Framework,
  getClassMetadata,
  getProviderName,
  getProviderUUId,
  listModule,
  Utils,
} from '@midwayjs/decorator';
import { Application, Context, IQueue } from './interface';
import { BullQueueManager } from './queueManager';
import { BULL_QUEUE_KEY } from './constants';
import { QueueOptions } from 'bull';

@Framework()
export class BullFramework extends BaseFramework<Application, Context, any> {
  bullQueueManager: BullQueueManager;
  bullDefaultConfig: any;

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
    this.bullQueueManager = await this.applicationContext.getAsync(
      BullQueueManager
    );
    const queueList = listModule(BULL_QUEUE_KEY);
    this.bullDefaultConfig = this.configService.getConfiguration(
      'bull.defaultQueueOptions'
    );

    for (const queueModule of queueList) {
      const queueModuleMeta = getClassMetadata(BULL_QUEUE_KEY, queueModule);
      const queueOptions = {
        ...this.bullDefaultConfig,
        ...queueModuleMeta.queueOptions,
      };
      // bind on error event
      this.addQueue(
        queueModule,
        queueModuleMeta.queueName,
        queueModuleMeta.concurrency,
        queueOptions
      );
    }
  }

  public addQueue(
    queueModule: new (...args) => IQueue,
    queueName: string,
    concurrency: number,
    queueOptions: QueueOptions
  ) {
    const queue = this.bullQueueManager.createQueue(queueName, queueOptions);

    queue.process(concurrency, async job => {
      const ctx = this.app.createAnonymousContext({
        jobId: job.id,
        triggerName: getProviderName(queueModule),
        triggerUUID: getProviderUUId(queueModule),
      });

      const service = await ctx.requestContext.getAsync<IQueue>(queueModule);
      const fn = await this.applyMiddleware(async ctx => {
        return await Utils.toAsyncFunction(service.execute.bind(service))(
          job.data,
          job
        );
      });

      try {
        await fn(ctx);
      } catch (err) {
        ctx.logger.error(err);
      }
    });
  }

  configure() {
    return this.configService.getConfiguration('bull');
  }

  getFrameworkName(): string {
    return 'bull';
  }

  async run() {
    await this.bullQueueManager.start();
  }

  protected async beforeStop() {
    await this.bullQueueManager.stop();
  }
}
