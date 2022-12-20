import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  MidwayDecoratorService,
  App,
  Configuration,
  Init,
  Inject,
} from '@midwayjs/core';
import { ORM_DATA_SOURCE_KEY, ORM_MODEL_KEY } from './decorator';
import { TypeORMDataSourceManager } from './dataSourceManager';
import { useContainer, EntityTarget } from 'typeorm';

@Configuration({
  importConfigs: [
    {
      default: {
        typeorm: {},
        midwayLogger: {
          clients: {
            typeormLogger: {
              fileLogName: 'typeorm.log',
              enableError: false,
            },
          },
        },
      },
    },
  ],
  namespace: 'typeorm',
})
export class OrmConfiguration implements ILifeCycle {
  @App()
  app: IMidwayApplication;

  @Inject()
  decoratorService: MidwayDecoratorService;

  dataSourceManager: TypeORMDataSourceManager;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      ORM_MODEL_KEY,
      (
        propertyName,
        meta: {
          modelKey: EntityTarget<unknown>;
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
      ORM_DATA_SOURCE_KEY,
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
    useContainer(container);
    this.dataSourceManager = await container.getAsync(TypeORMDataSourceManager);
  }

  async onStop(container: IMidwayContainer) {
    const dataSourceManager = await container.getAsync(
      TypeORMDataSourceManager
    );
    await dataSourceManager.stop();
  }
}
