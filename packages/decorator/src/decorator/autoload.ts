import { savePreloadModule } from '../decoratorManager';

export function Autoload() {
  return function (target) {
    savePreloadModule(target);
  };
}
