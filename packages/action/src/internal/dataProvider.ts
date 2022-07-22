import { Provide, Scope, ScopeEnum, Init, Config } from '@midwayjs/decorator';
import { ActionConfigOptions } from '../interface';
import { ActionDataProviderBase } from './baseData';
import { DataTableName } from './constants';
import { ActionDataProviderMemory } from './memoryData';
@Provide()
@Scope(ScopeEnum.Singleton)
export class ActionDataProvider {
  @Config()
  action: ActionConfigOptions;

  dataProvider: ActionDataProviderBase;

  @Init()
  async init() {
    this.dataProvider = new ActionDataProviderMemory(this.action);
    await this.dataProvider.init();
  }

  async insert(tabelName: DataTableName, info: any) {
    return this.dataProvider.insert(tabelName, info);
  }
}
