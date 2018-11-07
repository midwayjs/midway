import 'reflect-metadata';
import { scope, ScopeEnum } from 'injection';
import { WEB_ROUTER_PREFIX_CLS, WEB_ROUTER_PRIORITY, SCHEDULE_CLASS } from './metaKeys';

export function controller(routerPrefix: string) {
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

interface SchedueOpts {
  interval: number;
  type: string;
}

export function schedule (scheduleOpts: SchedueOpts | string) {
  return function(target: any): void {
    Reflect.defineMetadata(SCHEDULE_CLASS, scheduleOpts, target);
    scope(ScopeEnum.Request)(target);
  };
}
