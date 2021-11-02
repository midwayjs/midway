import { ObjectIdentifier } from '../../interface';
import { savePropertyInject } from '../../index';

export function Inject(identifier?: ObjectIdentifier) {
  return function (target: any, targetKey: string): void {
    savePropertyInject({ target, targetKey, identifier });
  };
}
