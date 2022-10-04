import {
  Config,
  Configuration,
  getClassMetadata,
  Init,
  Inject,
  listModule,
  App,
  IMidwayApplication,
  IMidwayContainer,
  MidwayDecoratorService,
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

  modelMap = new WeakMap();

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
        return this.modelMap.get(meta.modelKey);
      }
    );
  }

  async onReady(container: IMidwayContainer) {
    const connectionFactory = await container.getAsync(
      mongoose.MongooseDataSourceManager
    );

    for (const dataSourceName of connectionFactory.getDataSourceNames()) {
      const conn = connectionFactory.getDataSource(dataSourceName);
      if (conn && (conn as any).entities) {
        for (const Model of (conn as any).entities) {
          const model = getModelForClass(Model, { existingConnection: conn });
          this.modelMap.set(Model, model);
        }
      }
    }

    const Models = listModule(ENTITY_MODEL_KEY);
    // 兼容老代码
    for (const Model of Models) {
      const metadata = getClassMetadata(ENTITY_MODEL_KEY, Model) ?? {};
      const connectionName = metadata.connectionName ?? 'default';
      const conn = connectionFactory.getDataSource(connectionName);
      if (conn) {
        const model = getModelForClass(Model, { existingConnection: conn });
        this.modelMap.set(Model, model);
      } else {
        throw new Error(`connection name ${metadata.connectionName} not found`);
      }
    }

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
