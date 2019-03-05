import { attachClassMetadata } from 'injection';
import { LOGGER_KEY } from '../constant';
import { attachConstructorDataOnClass } from '../utils';

export function logger(identifier?: string) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, LOGGER_KEY, index);
    } else {
      if (!identifier) {
        identifier = targetKey;
      }
      attachClassMetadata(LOGGER_KEY, {
        key: identifier,
        propertyName: targetKey
      }, target);
    }
  };
}
