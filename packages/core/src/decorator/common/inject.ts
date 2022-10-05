import { savePropertyInject } from '../decoratorManager';
import { ObjectIdentifier } from '../interface';

export function Inject(identifier?: ObjectIdentifier) {
  return function (target: any, targetKey: string): void {
    savePropertyInject({ target, targetKey, identifier });
  };
}
