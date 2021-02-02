import { savePreloadModule } from '../common/decoratorManager';

export function Autoload() {
  return function (target) {
    savePreloadModule(target);
  };
}
