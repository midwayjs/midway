import { ObjectIdentifier } from '../interface';
import { savePropertyInject } from '../';

export function Inject(identifier?: ObjectIdentifier) {
  return function (target: any, targetKey: string): void {
    savePropertyInject({ target, targetKey, identifier });
  };
}
