import * as Joi from 'joi';
import { MetadataManager } from '@midwayjs/core';
import { RULES_KEY } from '../constants';

export function Rule(rule: Joi.AnySchema<any>): PropertyDecorator {
  return function (target, propertyKey?: string) {
    if (propertyKey) {
      MetadataManager.defineMetadata(RULES_KEY, rule, target, propertyKey);
    }
  };
}

export { Joi as RuleType };
