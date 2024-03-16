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
import {
  DATA_SOURCE_KEY,
  ENTITY_MANAGER_KEY,
  ENTITY_MODEL_KEY,
} from './decorator';
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
        const name =
          meta.connectionName ||
          this.dataSourceManager.getDefaultDataSourceName();

        if (RequestContext.getEntityManager(name)) {
          return RequestContext.getEntityManager(name).getRepository(
            meta.modelKey
          );
        } else {
          return this.dataSourceManager
            .getDataSource(name)
            .em.getRepository(meta.modelKey);
        }
      }
    );

    this.decoratorService.registerPropertyHandler(
      ENTITY_MANAGER_KEY,
      (propertyName, meta: { connectionName?: string }) => {
        const name =
          meta.connectionName ||
          this.dataSourceManager.getDefaultDataSourceName();
        if (RequestContext.getEntityManager(name)) {
          return RequestContext.getEntityManager(name);
        } else {
          return this.dataSourceManager.getDataSource(name).em;
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
          if (RequestContext['createAsync']) {
            // mikro-orm 5.x
            return await RequestContext['createAsync'](entityManagers, next);
          } else {
            // mikro-orm 6.x
            return await RequestContext.create(entityManagers, next);
          }
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
