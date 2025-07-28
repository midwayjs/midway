import {
  Config,
  Configuration,
  Init,
  Inject,
  listModule,
  App,
  IMidwayApplication,
  IMidwayContainer,
  MidwayDecoratorService,
  MidwayCommonError,
} from '@midwayjs/core';
import * as mongoose from '@midwayjs/mongoose';
import { ENTITY_MODEL_KEY } from './interface';
import { getModelForClass } from '@typegoose/typegoose';
import * as mongo from 'mongoose';

@Configuration({
  namespace: 'typegoose',
  imports: [mongoose],
})
export class TypegooseConfiguration {
  @Config('mongoose')
  oldMongooseConfig;

  legacyMode = false;

  @App()
  app: IMidwayApplication;

  @Inject()
  decoratorService: MidwayDecoratorService;

  dataSourceManager: mongoose.MongooseDataSourceManager;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      ENTITY_MODEL_KEY,
      (
        propertyName,
        meta: {
          modelKey: any;
          connectionName: string;
        }
      ) => {
        // get connection
        const conn = this.dataSourceManager.getDataSource(
          meta.connectionName ||
            this.dataSourceManager.getDataSourceNameByModel(meta.modelKey) ||
            this.dataSourceManager.getDefaultDataSourceName()
        );
        if (!conn) {
          throw new MidwayCommonError(
            `DataSource ${meta.connectionName} not found with current model ${meta.modelKey}, please check it.`
          );
        }
        return getModelForClass(meta.modelKey, { existingConnection: conn });
      }
    );
  }

  async onReady(container: IMidwayContainer) {
    this.dataSourceManager = await container.getAsync(
      mongoose.MongooseDataSourceManager
    );
    const Models = listModule(ENTITY_MODEL_KEY);

    // 兼容老代码
    if (Models.length === 0 && this.oldMongooseConfig['uri']) {
      this.legacyMode = true;
      await mongo.connect(
        this.oldMongooseConfig.uri,
        this.oldMongooseConfig.options
      );
    }
  }

  async onStop() {
    if (this.legacyMode) {
      await mongo.disconnect();
    }
  }
}
