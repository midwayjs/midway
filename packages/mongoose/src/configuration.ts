import { Configuration, Inject } from '@midwayjs/decorator';
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
  @Inject()
  factoryService: MongooseConnectionServiceFactory;

  async onReady(container: IMidwayContainer) {}

  async onStop() {
    await this.factoryService.stop();
  }
}
