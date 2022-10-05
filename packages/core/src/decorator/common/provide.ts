import { saveProviderId } from '../decoratorManager';
import { ObjectIdentifier } from '../interface';

export function Provide(identifier?: ObjectIdentifier) {
  return function (target: any) {
    return saveProviderId(identifier, target);
  };
}
