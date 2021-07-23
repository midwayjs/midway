// import * as joi from 'joi';
// import {
//   attachClassMetadata,
//   getClassMetadata,
//   getPropertyType,
//   saveClassMetadata,
//   RULES_KEY,
// } from '..';
//
// export interface RuleOptions {
//   required?: boolean;
// }
//
// export function Rule(rule, options: RuleOptions = { required: true }) {
//   return function (...args) {
//     if (args[1]) {
//       // 函数装饰器
//       const [target, propertyKey] = args;
//       if (!joi.isSchema(rule)) {
//         rule = getClassMetadata(RULES_KEY, rule);
//         if (getPropertyType(target, propertyKey).name === 'Array') {
//           rule = joi.array().items(rule);
//         } else {
//           rule = joi.object(rule);
//         }
//         if (options.required) {
//           rule = rule.required();
//         }
//       }
//
//       attachClassMetadata(RULES_KEY, rule, target, propertyKey);
//     } else {
//       //类的装饰器
//       const rules = getClassMetadata(RULES_KEY, rule);
//       if (rules) {
//         let currentRule = getClassMetadata(RULES_KEY, args[0]);
//         currentRule = currentRule ?? {};
//         Object.keys(rules).map(item => {
//           if (!currentRule[item]) {
//             currentRule[item] = rules[item];
//           }
//         });
//         saveClassMetadata(RULES_KEY, currentRule, args[0]);
//       }
//     }
//   };
// }
//
// export { joi as RuleType };
