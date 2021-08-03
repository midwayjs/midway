import { Config, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import * as mongoose from 'mongoose';

@Provide('mongooseService')
@Scope(ScopeEnum.Singleton)
export class MongooseService {
  @Config('mongoose')
  config;

  @Init()
  async init() {
    await mongoose.connect(this.config.uri, this.config.options);
  }
}
