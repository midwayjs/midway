import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { MongooseConnectionServiceFactory } from './manager';

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
  async onReady(container: IMidwayContainer) {
    await container.getAsync(MongooseConnectionServiceFactory);
  }

  async onStop(container: IMidwayContainer) {
    const factory = await container.getAsync(MongooseConnectionServiceFactory);
    await factory.stop();
  }
}
