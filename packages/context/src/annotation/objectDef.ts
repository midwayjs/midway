import 'reflect-metadata';
import {OBJ_DEF_CLS} from '../utils/metaKeys';

const debug = require('debug')('midway:context:obj_def');

function attachObjectDefProps(target, options) {
  let result = Reflect.hasMetadata(OBJ_DEF_CLS, target);
  if (result) {
    let data = Reflect.getMetadata(OBJ_DEF_CLS, target);
    Reflect.defineMetadata(OBJ_DEF_CLS, Object.assign(data, options), target);
  } else {
    Reflect.defineMetadata(OBJ_DEF_CLS, options, target);
  }
  return target;
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

export function singleton(isSingleton: boolean = true) {
  return function (target: any): void {
    debug(`set [destroy] property in [${target.name}]`);
    return attachObjectDefProps(target, {isSingleton: isSingleton});
  };
}
