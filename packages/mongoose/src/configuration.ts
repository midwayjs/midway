import { Configuration, ILifeCycle, IMidwayContainer } from '@midwayjs/core';
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
  importConfigFilter: config => {
    if (config['mongoose']) {
      if (config['mongoose']['client']) {
        config['mongoose']['dataSource'] =
          config['mongoose']['dataSource'] || {};
        config['mongoose']['dataSource']['default'] =
          config['mongoose']['client'];
        delete config['mongoose']['client'];
      }
      if (config['mongoose']['clients']) {
        config['mongoose']['dataSource'] = config['mongoose']['clients'];
        delete config['mongoose']['clients'];
      }
    }
    return config;
  },
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
