import {
  Config,
  Configuration,
  getClassMetadata,
  Init,
  Inject,
  listModule,
  App,
} from '@midwayjs/decorator';
import * as mongoose from '@midwayjs/mongoose';
import { ENTITY_MODEL_KEY } from './interface';
import { getModelForClass } from '@typegoose/typegoose';
import * as mongo from 'mongoose';
import { IMidwayApplication } from '@midwayjs/core';
import { MidwayFrameworkService } from '@midwayjs/core/dist';

@Configuration({
  namespace: 'typegoose',
  imports: [mongoose],
})
export class TypegooseConfiguration {
  @Inject()
  connectionFactory: mongoose.MongooseConnectionServiceFactory;

  @Config('mongoose')
  oldMongooseConfig;

  legacyMode = false;

  @App()
  app: IMidwayApplication;

  @Inject()
  frameworkService: MidwayFrameworkService;

  modelMap = new WeakMap();

  @Init()
  async init() {
    this.frameworkService.registerPropertyHandler(
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

  async onReady() {
    const Models = listModule(ENTITY_MODEL_KEY);
    for (const Model of Models) {
      const metadata = getClassMetadata(ENTITY_MODEL_KEY, Model) ?? {};
      const connectionName = metadata.connectionName ?? 'default';
      const conn = this.connectionFactory.get(connectionName);
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
