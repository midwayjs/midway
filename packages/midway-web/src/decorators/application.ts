import 'reflect-metadata';
import {WEB_ROUTER_PREFIX_CLS} from './metaKeys';

export function controller(routerPrefix: string) {
  return function (target: any): void {
    Reflect.defineMetadata(WEB_ROUTER_PREFIX_CLS, routerPrefix, target);
  };
}
