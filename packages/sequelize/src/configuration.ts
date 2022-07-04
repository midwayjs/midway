import { Config, Configuration, Init, Inject } from '@midwayjs/decorator';
import { SequelizeDataSourceManager } from './dataSourceManager';
import { IMidwayContainer, MidwayDecoratorService } from '@midwayjs/core';
import { ENTITY_MODEL_KEY } from './decorator';
import { Model } from 'sequelize-typescript';

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
export class SequelizeConfiguration {
  @Config('sequelize')
  sequelizeConfig;

  @Inject()
  decoratorService: MidwayDecoratorService;

  dataSourceManager: SequelizeDataSourceManager;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      ENTITY_MODEL_KEY,
      (
        propertyName,
        meta: {
          modelKey: { new (): Model<any, any> };
          connectionName?: string;
        }
      ) => {
        return this.dataSourceManager
          .getDataSource(
            meta.connectionName ||
              this.dataSourceManager.getDataSourceNameByModel(meta.modelKey)
          )
          .getRepository(meta.modelKey);
      }
    );
  }

  async onReady(container: IMidwayContainer) {
    this.dataSourceManager = await container.getAsync(
      SequelizeDataSourceManager
    );
  }

  async onStop() {
    if (this.dataSourceManager) {
      await this.dataSourceManager.stop();
    }
  }
}
