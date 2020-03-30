import * as joi from 'joi';

export function Rule(rule) {
  return function (target: any, propertyKey: string) {
    if (!rule.isJoi) {
      rule = Reflect.getMetadata('rules', rule.prototype);
      if (Reflect.getMetadata('design:type', target, propertyKey).name === 'Array') {
        rule = joi.array().items(rule).required();
      } else {
        rule = joi.object(rule).required();
      }
    }
    let rules = Reflect.getMetadata('rules', target);
    if (!rules) {
      rules = {};
    }
    rules[propertyKey] = rule;
    Reflect.defineMetadata('rules', rules, target);
  };
}

export { joi as RuleType };
