import { Scope } from '../objectDef';
import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  CONTROLLER_KEY,
} from '../../';
import { MiddlewareParamArray } from '../../interface';

export interface ControllerOption {
  prefix: string;
  routerOptions: {
    sensitive?: boolean;
    middleware?: MiddlewareParamArray;
    alias?: string[];
    description?: string;
    tagName?: string;
  };
}

export function Controller(
  prefix = '/',
  routerOptions: {
    sensitive?: boolean;
    middleware?: MiddlewareParamArray;
    description?: string;
    tagName?: string;
  } = { middleware: [], sensitive: true }
): ClassDecorator {
  return (target: any) => {
    saveModule(CONTROLLER_KEY, target);
    if (prefix)
      saveClassMetadata(
        CONTROLLER_KEY,
        {
          prefix,
          routerOptions,
        } as ControllerOption,
        target
      );
    Scope(ScopeEnum.Request)(target);
  };
}
