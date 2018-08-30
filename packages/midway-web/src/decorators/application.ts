import 'reflect-metadata';
import {scope, ScopeEnum} from 'injection';
import {WEB_ROUTER_PREFIX_CLS} from './metaKeys';

export function controller(routerPrefix: string) {
  return function (target: any): void {
    Reflect.defineMetadata(WEB_ROUTER_PREFIX_CLS, routerPrefix, target);
    scope(ScopeEnum.Request)(target);
  };
}
