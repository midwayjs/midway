import * as joi from 'joi';
import { attachClassMetadata, getClassMetadata, getPropertyType, RULES_KEY } from '..';

export function Rule(rule) {
  return function (target: any, propertyKey: string) {
    if (!rule.isJoi) {
      rule = getClassMetadata(RULES_KEY, rule);
      if (getPropertyType(target, propertyKey)?.name === 'Array') {
        rule = joi.array().items(rule).required();
      } else {
        rule = joi.object(rule).required();
      }
    }

    attachClassMetadata(RULES_KEY, rule, target, propertyKey);
  };
}

export { joi as RuleType };
