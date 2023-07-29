import {
  Configuration,
  IMidwayContainer,
  Init,
  Inject,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { LeoricDataSourceManager } from './dataSourceManager';
import { DATA_SOURCE_KEY, MODEL_KEY } from './decorator';
import { ClassLikeBone } from './interface';

function getModelName(model: string | ClassLikeBone): string {
  if (typeof model === 'string') return model;
  return model.name;
}

@Configuration({
  namespace: 'leoric',
  importConfigs: [
    {
      default: {
        leoric: {},
      },
    },
  ],
})
export class LeoricConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  dataSourceManager: LeoricDataSourceManager;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      MODEL_KEY,
      (
        propertyName,
        meta: { modelName?: string | ClassLikeBone; connectionName?: string }
      ) => {
        return this.dataSourceManager.getDataSource(
          meta.connectionName ||
            this.dataSourceManager.getDataSourceNameByModel(meta.modelName) ||
            this.dataSourceManager.getDefaultDataSourceName()
        ).models[getModelName(meta.modelName)];
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
