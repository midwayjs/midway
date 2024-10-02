import { DecoratorManager } from '../decoratorManager';
import { Provide } from './provide';

export function Autoload() {
  return function (target) {
    DecoratorManager.savePreloadModule(target);
    Provide()(target);
  };
}
