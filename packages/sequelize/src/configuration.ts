import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { SequelizeServiceFactory } from './manager';

@Configuration({
  namespace: 'sequelize',
  importConfigs: [
    {
      default: {
        sequelize: {},
      },
    },
  ],
})
export class SequelizeConfiguration implements ILifeCycle {
  async onReady(container: IMidwayContainer) {
    await container.getAsync(SequelizeServiceFactory);
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    const factory = await container.getAsync(SequelizeServiceFactory);
    await factory.stop();
  }
}
