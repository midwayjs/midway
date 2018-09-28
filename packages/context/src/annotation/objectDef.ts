import 'reflect-metadata';
import { OBJ_DEF_CLS } from '../utils/metaKeys';
import { Scope } from '../interfaces';
import { ObjectDefinitionOptions, ScopeEnum } from '..';

const debug = require('debug')('midway:context:obj_def');

function attachObjectDefProps(target, options) {
  let data = initOrGetObjectDefProps(target);
  Reflect.defineMetadata(OBJ_DEF_CLS, Object.assign(data, options), target);
  return target;
}

export function initOrGetObjectDefProps(target): ObjectDefinitionOptions {
  let result = Reflect.hasMetadata(OBJ_DEF_CLS, target);
  if (!result) {
    Reflect.defineMetadata(OBJ_DEF_CLS, {}, target);
  }
  return Reflect.getMetadata(OBJ_DEF_CLS, target);
}

export function async() {
  return function (target: any): void {
    debug(`set [async] property in [${target.name}]`);
    return attachObjectDefProps(target, {isAsync: true});
  };
}

export function init() {
  return function (target: any, propertyKey: string): void {
    debug(`set [init] property in [${target.constructor.name}]`);
    return attachObjectDefProps(target.constructor, {initMethod: propertyKey});
  };
}

export function destroy() {
  return function (target: any, propertyKey: string): void {
    debug(`set [destroy] property in [${target.constructor.name}]`);
    return attachObjectDefProps(target.constructor, {destroyMethod: propertyKey});
  };
}

export function scope(scope: Scope = ScopeEnum.Singleton) {
  return function (target: any): void {
    debug(`set [scope] property in [${target.name}]`);
    return attachObjectDefProps(target, {scope});
  };
}

export function autowire(isAutowire: boolean = true) {
  return function (target: any): void {
    debug(`set [autowire] property in [${target.name}]`);
    return attachObjectDefProps(target, {isAutowire});
  };
}
