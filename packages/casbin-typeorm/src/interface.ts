import { CasbinRule } from './casbinRule';
import { CasbinMongoRule } from './casbinMongoRule';
import { DataSourceOptions } from 'typeorm';

export type GenericCasbinRule = CasbinRule | CasbinMongoRule;
export type CasbinRuleConstructor = new (...args: any[]) => GenericCasbinRule;

export interface TypeORMAdapterConfig {
  dataSourceName?: string;
  dataSourceOption?: DataSourceOptions;
  customCasbinRuleEntity?: CasbinRuleConstructor;
}

export const DefaultTypeORMDataSourceName = 'node-casbin-official';
