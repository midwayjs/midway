import 'reflect-metadata';
import { scope, ScopeEnum } from 'injection';
import { WEB_ROUTER_PREFIX_CLS, WEB_ROUTER_PRIORITY } from './metaKeys';

export function controller(routerPrefix: string, priority: number = 0) {
  return function (target: any): void {
    Reflect.defineMetadata(WEB_ROUTER_PREFIX_CLS, routerPrefix, target);
    scope(ScopeEnum.Request)(target);
  };
}

export function priority(priority: number) {
  return function (target: any): void {
    Reflect.defineMetadata(WEB_ROUTER_PRIORITY, priority, target);
  };
}
