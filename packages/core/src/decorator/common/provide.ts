import { DecoratorManager } from '../decoratorManager';
import { ObjectIdentifier } from '../../interface';

export function Provide(identifier?: ObjectIdentifier) {
  return function (target: any) {
    DecoratorManager.saveProviderId(identifier, target);
  };
}
