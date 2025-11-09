import {
  APPLICATION_KEY,
  ApplicationContext,
  Configuration,
  IMidwayContainer,
  Init,
  Inject,
  MidwayDecoratorService,
  REQUEST_OBJ_CTX_KEY,
  ScopeEnum,
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

  @ApplicationContext()
  applicationContext: IMidwayContainer;

  dataSourceManager: LeoricDataSourceManager;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      MODEL_KEY,
      (
        propertyName,
        meta: { modelName?: string | ClassLikeBone; connectionName?: string },
        instance
      ) => {
        const dataSource = this.dataSourceManager.getDataSource(
          meta.connectionName ||
            this.dataSourceManager.getDataSourceNameByModel(meta.modelName) ||
            this.dataSourceManager.getDefaultDataSourceName()
        );
        const model = dataSource.models[getModelName(meta.modelName)];
        const app = instance[APPLICATION_KEY];
        if (
          this.applicationContext.getInstanceScope(instance) ===
          ScopeEnum.Request
        ) {
          const ctx = instance[REQUEST_OBJ_CTX_KEY];
          return class extends model {
            static get ctx() {
              return ctx;
            }
            static get app() {
              return ctx.getApp();
            }
          };
        }
        return class extends model {
          static get app() {
            return app;
          }
        };
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
