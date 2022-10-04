import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { App, Configuration, Init, Inject } from '@midwayjs/core';
import { ORM_MODEL_KEY } from './decorator';
import { TypeORMDataSourceManager } from './dataSourceManager';
import { useContainer, EntityTarget } from 'typeorm';

@Configuration({
  importConfigs: [
    {
      default: {
        typeorm: {},
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
              this.dataSourceManager.getDataSourceNameByModel(meta.modelKey)
          )
          .getRepository(meta.modelKey);
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
