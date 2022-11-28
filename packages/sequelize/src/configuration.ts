import {
  Config,
  Configuration,
  Init,
  Inject,
  IMidwayContainer,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { SequelizeDataSourceManager } from './dataSourceManager';
import { DATA_SOURCE_KEY, ENTITY_MODEL_KEY } from './decorator';
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
  importConfigFilter: config => {
    if (config['sequelize'] && config['sequelize']['options']) {
      config['sequelize'].options.sync = config['sequelize'].sync || false;
      const legacyDataSourceConfig = config['sequelize'].options;
      delete config['sequelize']['options'];
      config['sequelize'].dataSource = {
        default: legacyDataSourceConfig,
      };
    }
    return config;
  },
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
              this.dataSourceManager.getDataSourceNameByModel(meta.modelKey) ||
              this.dataSourceManager.getDefaultDataSourceName()
          )
          .getRepository(meta.modelKey);
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
