import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  MidwayDecoratorService,
  MidwayCommonError,
  MainApp,
  Configuration,
  Init,
  Inject,
  MetadataManager,
} from '@midwayjs/core';
import { ORM_DATA_SOURCE_KEY, ORM_MODEL_KEY } from './decorator';
import { TypeORMDataSourceManager } from './dataSourceManager';
import {
  useContainer,
  EntityTarget,
  TreeRepository,
  MongoRepository,
  Repository,
} from 'typeorm';

@Configuration({
  importConfigs: [
    {
      default: {
        typeorm: {},
        midwayLogger: {
          clients: {
            typeormLogger: {
              lazyLoad: true,
              fileLogName: 'midway-typeorm.log',
              enableError: false,
              level: 'info',
            },
          },
        },
      },
    },
  ],
  namespace: 'typeorm',
})
export class OrmConfiguration implements ILifeCycle {
  @MainApp()
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
        },
        instance
      ) => {
        const dataSource = this.dataSourceManager.getDataSource(
          meta.connectionName ||
            this.dataSourceManager.getDataSourceNameByModel(meta.modelKey) ||
            this.dataSourceManager.getDefaultDataSourceName()
        );
        if (!dataSource) {
          throw new MidwayCommonError(
            `DataSource ${meta.connectionName} not found with current model ${meta.modelKey}, please check it.`
          );
        }
        const type = MetadataManager.getPropertyType(instance, propertyName);
        if (type.originDesign === Repository) {
          return dataSource.getRepository(meta.modelKey);
        } else if (type.originDesign === TreeRepository) {
          return dataSource.getTreeRepository(meta.modelKey);
        } else if (type.originDesign === MongoRepository) {
          return dataSource.getMongoRepository(meta.modelKey);
        } else {
          return dataSource.getRepository(meta.modelKey);
        }
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
