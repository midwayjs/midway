import { Scope } from '../annotation';
import { ScopeEnum, saveClassMetadata, saveModule, CONTROLLER_KEY } from '../common';
import { KoaMiddlewareParamArray } from '../interface';

export interface ControllerOption {
  prefix: string;
  routerOptions: {
    sensitive?: boolean;
    middleware?: KoaMiddlewareParamArray;
    alias?: string[];
  };
}

export function Controller(prefix: string, routerOptions: {
  sensitive?: boolean,
  middleware?: KoaMiddlewareParamArray
 } = {middleware: [], sensitive: true}
  ): ClassDecorator {
  return (target: any) => {
    saveModule(CONTROLLER_KEY, target);
    saveClassMetadata(CONTROLLER_KEY, {
      prefix,
      routerOptions
    } as ControllerOption, target);
    Scope(ScopeEnum.Request)(target);
  };
}
