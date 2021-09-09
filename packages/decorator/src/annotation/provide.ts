import { ObjectIdentifier } from '../interface';
import { saveProviderId, saveConstructorInject, savePropertyInject } from '../';

export function Provide(identifier?: ObjectIdentifier) {
  return function (target: any) {
    return saveProviderId(identifier, target);
  };
}

export function Inject(identifier?: ObjectIdentifier) {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
      saveConstructorInject({ target, targetKey, identifier, index });
    } else {
      savePropertyInject({ target, targetKey, identifier });
    }
  };
}
