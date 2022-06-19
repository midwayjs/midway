import { Config, Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';

import { Sequelize } from 'sequelize-typescript';
import * as DefaultConfig from './config/config.default';
import { SequelizeDataSourceManager } from './dataSourceManager';

@Configuration({
  namespace: 'sequelize',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class SequelizeConfiguration implements ILifeCycle {
  dataSourceManager: SequelizeDataSourceManager;

  async onReady(container: IMidwayContainer) {
    this.dataSourceManager = await container.getAsync(
      SequelizeDataSourceManager
    );
  }

  async onStop(container: IMidwayContainer) {
    const dataSourceManager = await container.getAsync(
      SequelizeDataSourceManager
    );
    await dataSourceManager.stop();
  }
}
