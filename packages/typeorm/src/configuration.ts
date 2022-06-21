import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { App, Configuration, Init, Inject } from '@midwayjs/decorator';
import { ORM_MODEL_KEY } from './decorator';
import { TypeORMDataSourceManager } from './dataSourceManager';
import { useContainer } from 'typeorm';

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
          modelKey: string;
          connectionName: string;
        }
      ) => {
        return this.dataSourceManager
          .getDataSource(meta.connectionName)
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
