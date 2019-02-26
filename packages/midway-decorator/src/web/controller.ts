import { saveClassMetaData, saveModule, scope, ScopeEnum } from 'injection';
import { CONTROLLER_KEY } from '../constant';
import { WebMiddleware } from '../interface';

export interface ControllerOption {
  prefix: string;
  routerOptions: { middleware?: Array<string | WebMiddleware> };
}

export function controller(prefix: string, routerOptions: { middleware: Array<string | WebMiddleware> } = {middleware: []}): ClassDecorator {
  return (target: any) => {
    saveModule(CONTROLLER_KEY, target);
    saveClassMetaData(CONTROLLER_KEY, {
      prefix,
      routerOptions
    } as ControllerOption, target);
    scope(ScopeEnum.Request)(target);
  };
}
