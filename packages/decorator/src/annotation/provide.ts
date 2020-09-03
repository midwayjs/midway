import { ObjectIdentifier } from '../interface';
import { saveProviderId } from '../';

export function Provide(identifier?: ObjectIdentifier) {
  return function (target: any) {
    return saveProviderId(identifier, target);
  };
}
