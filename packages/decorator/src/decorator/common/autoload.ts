import { savePreloadModule } from '../../decoratorManager';
import { Provide } from './provide';

export function Autoload() {
  return function (target) {
    savePreloadModule(target);
    Provide()(target);
  };
}
