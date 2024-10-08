import {
  Configuration,
  HealthResult,
  ILifeCycle,
  IMidwayContainer,
} from '@midwayjs/core';
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

  async onHealthCheck?(container: IMidwayContainer): Promise<HealthResult> {
    const clientNames = this.mongooseDataSourceManager.getDataSourceNames();

    // find status not ready
    let clientName: any;
    for (const name of clientNames) {
      if (
        !(await this.mongooseDataSourceManager.isConnected(name)) &&
        !this.mongooseDataSourceManager.isLowPriority(name)
      ) {
        clientName = name;
        break;
      }
    }

    return {
      status: !clientName,
      reason: clientName
        ? `mongoose dataSource "${clientName}" is not ready`
        : '',
    };
  }
}
