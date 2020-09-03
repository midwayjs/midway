import { ScopeEnum, saveObjectDefProps } from '../';

const debug = require('debug')('decorator:context:obj_def');

export function Async() {
  return function (target: any): void {
    debug(`set [async] property in [${target.name}]`);
    return saveObjectDefProps(target, {isAsync: true});
  };
}

export function Init() {
  return function (target: any, propertyKey: string): void {
    debug(`set [init] property in [${target.constructor.name}]`);
    return saveObjectDefProps(target.constructor, {initMethod: propertyKey});
  };
}

export function Destroy() {
  return function (target: any, propertyKey: string): void {
    debug(`set [destroy] property in [${target.constructor.name}]`);
    return saveObjectDefProps(target.constructor, {destroyMethod: propertyKey});
  };
}

export function Scope(scope: ScopeEnum = ScopeEnum.Singleton) {
  return function (target: any): void {
    debug(`set [scope] property in [${target.name}]`);
    return saveObjectDefProps(target, {scope});
  };
}

export function Autowire(isAutowire = true) {
  return function (target: any): void {
    debug(`set [autowire] property in [${target.name}]`);
    return saveObjectDefProps(target, {isAutowire});
  };
}
