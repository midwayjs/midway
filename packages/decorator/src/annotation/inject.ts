import { saveConstructorInject, savePropertyInject } from '../';
import { ObjectIdentifier } from '../interface';

export function Inject(identifier?: ObjectIdentifier) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      saveConstructorInject({ target, targetKey, identifier, index });
    } else {
      savePropertyInject({ target, targetKey, identifier });
    }
  };
}
