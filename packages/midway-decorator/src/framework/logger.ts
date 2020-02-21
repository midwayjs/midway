import { attachClassMetadata } from 'injection';

import { LOGGER_KEY } from '../constant';
import { attachConstructorDataOnClass } from '../utils';


export function logger(identifier?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function(target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, LOGGER_KEY, index);
    }
    else {
      let id = identifier;

      if (! id) {
        id = targetKey;
      }
      attachClassMetadata(LOGGER_KEY, {
        key: id,
        propertyName: targetKey,
      }, target);
    }
  };
}
