import { saveClassMetadata, saveModule, scope, ScopeEnum } from 'injection'

import { CONTROLLER_KEY } from '../constant'
import { KoaMiddlewareParamArray } from '../interface'


export interface ControllerOption {
  prefix: string
  routerOptions: {
    sensitive?: boolean,
    middleware?: KoaMiddlewareParamArray,
  }
}

export function controller(prefix: string, routerOptions: {
  sensitive?: boolean,
  middleware?: KoaMiddlewareParamArray,
} = { middleware: [], sensitive: true }): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any) => {
    saveModule(CONTROLLER_KEY, target)
    saveClassMetadata(CONTROLLER_KEY, {
      prefix,
      routerOptions,
    } as ControllerOption, target)
    scope(ScopeEnum.Request)(target)
  }
}
