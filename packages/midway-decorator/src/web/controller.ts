import { saveClassMetaData, saveModule, scope, ScopeEnum } from 'injection';
import { CONTROLLER_KEY } from '../constant';

export function controller(routerPrefix: string): ClassDecorator {
  return (target: any) => {
    saveModule(CONTROLLER_KEY, target);
    saveClassMetaData(CONTROLLER_KEY, routerPrefix, target);
    scope(ScopeEnum.Request)(target);
  };
}
