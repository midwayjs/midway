import { attachClassMetadata } from 'injection';
import { PLUGIN_KEY } from '../constant';
import { attachConstructorDataOnClass } from '../utils';

export function plugin(identifier?: string) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, PLUGIN_KEY, index);
    } else {
      if (!identifier) {
        identifier = targetKey;
      }
      attachClassMetadata(PLUGIN_KEY, {
        key: identifier,
        propertyName: targetKey
      }, target);
    }
  };
}
