import { Scope } from '../../decorator';
import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  WS_CONTROLLER_KEY,
} from '../../';
import { MiddlewareParamArray } from '../../interface';

export interface WSControllerOption {
  namespace: string;
  routerOptions: {
    middleware?: MiddlewareParamArray;
  };
}

export function WSController(
  namespace: string | RegExp = '/',
  routerOptions: {
    middleware?: MiddlewareParamArray;
  } = { middleware: [] }
): ClassDecorator {
  return (target: any) => {
    saveModule(WS_CONTROLLER_KEY, target);
    saveClassMetadata(
      WS_CONTROLLER_KEY,
      {
        namespace,
        routerOptions,
      } as WSControllerOption,
      target
    );
    Scope(ScopeEnum.Request)(target);
  };
}
