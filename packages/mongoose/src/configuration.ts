import { Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config.default';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { MongooseConnectionServiceFactory } from './manager';

@Configuration({
  namespace: 'mongoose',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class MongooseConfiguration implements ILifeCycle {
  async onReady(container: IMidwayContainer) {
    await container.getAsync(MongooseConnectionServiceFactory);
  }

  async onStop(container: IMidwayContainer) {
    const factoryService = await container.getAsync(
      MongooseConnectionServiceFactory
    );
    await factoryService.stop();
  }
}
