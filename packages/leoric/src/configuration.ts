import {
  Configuration,
  IMidwayContainer,
  Init,
  Inject,
  MidwayDecoratorService,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { LeoricDataSourceManager } from './dataSourceManager';
import { DATA_SOURCE_KEY, MODEL_KEY } from './decorator';

@Configuration({
  namespace: 'model',
  importConfigs: [{ default: DefaultConfig }],
})
export class LeoricConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  dataSourceManager: LeoricDataSourceManager;

  async onConfigLoad() {}

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      MODEL_KEY,
      (propertyName, meta: { modelName?: string; connectionName?: string }) => {
        return this.dataSourceManager.getDataSource(
          meta.connectionName ||
            this.dataSourceManager.getDataSourceNameByModel(meta.modelName) ||
            this.dataSourceManager.getDefaultDataSourceName()
        ).models[meta.modelName];
      }
    );

    this.decoratorService.registerPropertyHandler(
      DATA_SOURCE_KEY,
      (
        propertyName,
        meta: {
          dataSourceName?: string;
        }
      ) => {
        return this.dataSourceManager.getDataSource(
          meta.dataSourceName ||
            this.dataSourceManager.getDefaultDataSourceName()
        );
      }
    );
  }

  async onReady(container: IMidwayContainer) {
    this.dataSourceManager = await container.getAsync(LeoricDataSourceManager);
  }

  async onStop() {
    if (this.dataSourceManager) {
      await this.dataSourceManager.stop();
    }
  }
}
