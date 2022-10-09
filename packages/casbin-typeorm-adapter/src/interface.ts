import { CasbinRule } from './casbinRule';
import { CasbinMongoRule } from './casbinMongoRule';

export type GenericCasbinRule = CasbinRule | CasbinMongoRule;
export type CasbinRuleConstructor = new (...args: any[]) => GenericCasbinRule;

export interface TypeORMAdapterConfig {
  dataSourceName?: string;
  type?: string;
  customCasbinRuleEntity?: CasbinRuleConstructor;
}
