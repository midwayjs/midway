import { DecoratorManager } from '../decoratorManager';
import { Provide } from './provide';

export function Autoload() {
  return function (target) {
    DecoratorManager.savePreStartModule(target);
    Provide()(target);
  };
}
