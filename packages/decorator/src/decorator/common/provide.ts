import { ObjectIdentifier } from '../../interface';
import { saveProviderId } from '../../index';

export function Provide(identifier?: ObjectIdentifier) {
  return function (target: any) {
    return saveProviderId(identifier, target);
  };
}
