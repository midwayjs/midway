import { MetadataManager } from '@midwayjs/core';
import { RULES_KEY } from '../constants';

export function Rule(rule: any): PropertyDecorator {
  return function (target, propertyKey: string) {
    MetadataManager.defineMetadata(RULES_KEY, rule, target, propertyKey);
  };
}
