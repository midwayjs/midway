import { saveClassMetadata, saveModule, scope, ScopeEnum } from 'injection';
import { CONTROLLER_KEY } from '../constant';
import { KoaMiddleware } from '../interface';

export interface ControllerOption {
  prefix: string;
  routerOptions: { middleware?: Array<string | KoaMiddleware> };
}

export function controller(prefix: string, routerOptions: { middleware: Array<string | KoaMiddleware> } = {middleware: []}): ClassDecorator {
  return (target: any) => {
    saveModule(CONTROLLER_KEY, target);
    saveClassMetadata(CONTROLLER_KEY, {
      prefix,
      routerOptions
    } as ControllerOption, target);
    scope(ScopeEnum.Request)(target);
  };
}
