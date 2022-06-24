import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { MongooseDataSourceManager } from './manager';

@Configuration({
  namespace: 'mongoose',
  importConfigs: [
    {
      default: {
        mongoose: {},
      },
    },
  ],
})
export class MongooseConfiguration implements ILifeCycle {
  mongooseDataSourceManager: MongooseDataSourceManager;
  async onReady(container: IMidwayContainer) {
    this.mongooseDataSourceManager = await container.getAsync(
      MongooseDataSourceManager
    );
  }

  async onStop(container: IMidwayContainer) {
    await this.mongooseDataSourceManager.stop();
  }
}
