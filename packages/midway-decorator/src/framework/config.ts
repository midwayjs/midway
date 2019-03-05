import { attachClassMetadata } from 'injection';
import { CONFIG_KEY } from '../constant';
import { attachConstructorDataOnClass } from '../utils';

export function config(identifier?: string) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, CONFIG_KEY, index);
    } else {
      if (!identifier) {
        identifier = targetKey;
      }
      attachClassMetadata(CONFIG_KEY, {
        key: identifier,
        propertyName: targetKey
      }, target);
    }
  };
}
