import * as Joi from 'joi';
import {
  attachClassMetadata,
  getClassExtendedMetadata,
  getPropertyType
} from '@midwayjs/core';
import { RULES_KEY } from '../constants';

/**
 * @deprecated
 */
export interface RuleOptions {
  required?: boolean;
  min?: number;
  max?: number;
}

export function Rule(
  rule: Joi.AnySchema<any>
): PropertyDecorator & ClassDecorator;
/**
 * @deprecated
 */
export function Rule(
  rule: new (...args) => any,
  options?: RuleOptions
): PropertyDecorator & ClassDecorator;
export function Rule(
  rule: Joi.AnySchema<any> | (new (...args) => any),
  options: RuleOptions = { required: true }
): ClassDecorator & PropertyDecorator {
  return function (target, propertyKey?) {
    if (propertyKey) {
      // property decorator
      if (!Joi.isSchema(rule)) {
        // 老代码，待废弃
        rule = Joi.object(getClassExtendedMetadata(RULES_KEY, rule)).meta({
          id: rule.name,
        });
        if (getPropertyType(target, propertyKey).name === 'Array') {
          rule = Joi.array().items(rule);
          if (options.min) {
            rule = (rule as Joi.ArraySchema<any>).min(options.min);
          }
          if (options.max) {
            rule = (rule as Joi.ArraySchema<any>).max(options.max);
          }
        }
        if (options.required) {
          rule = rule.required();
        }
      }

      attachClassMetadata(RULES_KEY, rule, target, propertyKey as string);
    } else {
      // class decorator
      if (Joi.isSchema(rule)) {
        // TODO 下一个大版本，metadata 这里要完全重构，临时先加一个后缀
        // mix schema with property
        // saveClassMetadata(RULES_CLASS_KEY + '_EXT', rule, target);
      }
    }
  };
}

export { Joi as RuleType };
