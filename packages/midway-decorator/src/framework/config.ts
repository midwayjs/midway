import { attachClassMetadata } from 'injection';

import { CONFIG_KEY } from '../constant';
import { attachConstructorDataOnClass } from '../utils';


export function config(identifier?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function(target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      attachConstructorDataOnClass(identifier, target, CONFIG_KEY, index);
    }
    else {
      let idf = identifier;

      if (! idf) {
        idf = targetKey;
      }
      attachClassMetadata(CONFIG_KEY, {
        key: idf,
        propertyName: targetKey,
      }, target);
    }
  };
}
