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
  type: string;
  cron?: string;
  interval?: number | string;
  immediate?: boolean;
  disable?: boolean;
  env?: [string];
  cronOptions?: {
    currentDate: string,
    endDate: string
  }
}

export function schedule (scheduleOpts: SchedueOpts | string) {
  return function(target: any): void {
    Reflect.defineMetadata(SCHEDULE_CLASS, scheduleOpts, target);
    scope(ScopeEnum.Request)(target);
  };
}
