import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  MidwayApplicationManager,
  MidwayDecoratorService,
  App,
  Configuration,
  Init,
  Inject,
} from '@midwayjs/core';
import { DATA_SOURCE_KEY, ENTITY_MODEL_KEY } from './decorator';
import { MikroDataSourceManager } from './dataSourceManager';
import { EntityName, RequestContext } from '@mikro-orm/core';

@Configuration({
  importConfigs: [
    {
      default: {
        mikro: {},
      },
    },
  ],
  namespace: 'mikro',
})
export class MikroConfiguration implements ILifeCycle {
  @App()
  app: IMidwayApplication;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Inject()
  applicationManager: MidwayApplicationManager;

  dataSourceManager: MikroDataSourceManager;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      ENTITY_MODEL_KEY,
      (
        propertyName,
        meta: {
          modelKey: EntityName<any>;
          connectionName?: string;
        }
      ) => {
        if (RequestContext.getEntityManager()) {
          return RequestContext.getEntityManager().getRepository(meta.modelKey);
        } else {
          return this.dataSourceManager
            .getDataSource(
              meta.connectionName ||
                this.dataSourceManager.getDataSourceNameByModel(
                  meta.modelKey
                ) ||
                this.dataSourceManager.getDefaultDataSourceName()
            )
            .em.getRepository(meta.modelKey);
        }
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
    this.dataSourceManager = await container.getAsync(MikroDataSourceManager);

    const names = this.dataSourceManager.getDataSourceNames();
    const entityManagers = names.map(name => {
      return this.dataSourceManager.getDataSource(name).em;
    });
    if (names.length > 0) {
      // create mikro request scope
      // https://mikro-orm.io/docs/identity-map
      this.applicationManager.getApplications().forEach(app => {
        app.useMiddleware(async (ctx, next) => {
          return await RequestContext.createAsync(entityManagers, next);
        });
      });
    }
  }

  async onStop(container: IMidwayContainer) {
    if (this.dataSourceManager) {
      await this.dataSourceManager.stop();
    }
  }
}
