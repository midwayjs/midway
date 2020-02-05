import 'reflect-metadata';
import { initOrGetObjectDefProps, ScopeEnum, OBJ_DEF_CLS } from '../common';

const debug = require('debug')('injection:context:obj_def');

function attachObjectDefProps(target, options) {
  const data = initOrGetObjectDefProps(target);
  Reflect.defineMetadata(OBJ_DEF_CLS, Object.assign(data, options), target);
  return target;
}

export function Async() {
  return function (target: any): void {
    debug(`set [async] property in [${target.name}]`);
    return attachObjectDefProps(target, {isAsync: true});
  };
}

export function Init() {
  return function (target: any, propertyKey: string): void {
    debug(`set [init] property in [${target.constructor.name}]`);
    return attachObjectDefProps(target.constructor, {initMethod: propertyKey});
  };
}

export function Destroy() {
  return function (target: any, propertyKey: string): void {
    debug(`set [destroy] property in [${target.constructor.name}]`);
    return attachObjectDefProps(target.constructor, {destroyMethod: propertyKey});
  };
}

export function Scope(scope: ScopeEnum = ScopeEnum.Singleton) {
  return function (target: any): void {
    debug(`set [scope] property in [${target.name}]`);
    return attachObjectDefProps(target, {scope});
  };
}

export function Autowire(isAutowire = true) {
  return function (target: any): void {
    debug(`set [autowire] property in [${target.name}]`);
    return attachObjectDefProps(target, {isAutowire});
  };
}
