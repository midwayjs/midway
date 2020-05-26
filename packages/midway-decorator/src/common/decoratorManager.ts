import 'reflect-metadata';
import { ObjectDefinitionOptions, TagClsMetadata } from '../interface';
import { OBJ_DEF_CLS, TAGGED_CLS } from './constant';
import { classNamed } from './utils';

const debug = require('debug')('decorator:manager');

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

export type decoratorKey = string | symbol;

export const PRELOAD_MODULE_KEY = 'INJECTION_PRELOAD_MODULE_KEY';

export class DecoratorManager extends Map {

  /**
   * the key for meta data store in class
   */
  injectClassKeyPrefix = 'INJECTION_CLASS_META_DATA';
  /**
   * the key for method meta data store in class
   */
  injectClassMethodKeyPrefix = 'INJECTION_CLASS_METHOD_META_DATA';

  /**
   * the key for method meta data store in method
   */
  injectMethodKeyPrefix = 'INJECTION_METHOD_META_DATA';

  saveModule(key, module) {
    if (!this.has(key)) {
      this.set(key, new Set());
    }
    this.get(key).add(module);
  }

  resetModule(key) {
    this.set(key, new Set());
  }

  static getDecoratorClassKey(decoratorNameKey: decoratorKey) {
    return decoratorNameKey.toString() + '_CLS';
  }

  static getDecoratorMethodKey(decoratorNameKey: decoratorKey) {
    return decoratorNameKey.toString() + '_METHOD';
  }

  static getDecoratorClsMethodPrefix(decoratorNameKey: decoratorKey) {
    return decoratorNameKey.toString() + '_CLS_METHOD';
  }

  static getDecoratorClsMethodKey(decoratorNameKey: decoratorKey, methodKey: decoratorKey) {
    return DecoratorManager.getDecoratorClsMethodPrefix(decoratorNameKey) + ':' + methodKey.toString();
  }

  listModule(key) {
    return Array.from(this.get(key) || {});
  }

  static getOriginMetadata(metaKey, target, method?) {
    if (method) {
      // for property
      if (!Reflect.hasMetadata(metaKey, target, method)) {
        Reflect.defineMetadata(metaKey, new Map(), target, method);
      }
      return Reflect.getMetadata(metaKey, target, method);
    } else {
      // filter Object.create(null)
      if (typeof target === 'object' && target.constructor) {
        target = target.constructor;
      }
      // for class
      if (!Reflect.hasMetadata(metaKey, target)) {
        Reflect.defineMetadata(metaKey, new Map(), target);
      }
      return Reflect.getMetadata(metaKey, target);
    }
  }

  /**
   * save meta data to class or property
   * @param decoratorNameKey the alias name for decorator
   * @param data the data you want to store
   * @param target target class
   * @param propertyName
   */
  saveMetadata(decoratorNameKey: decoratorKey, data, target, propertyName?) {
    debug('saveMetadata %s on target %o propertyName = %s.', decoratorNameKey, target, propertyName);
    if (propertyName) {
      const originMap = DecoratorManager.getOriginMetadata(this.injectMethodKeyPrefix, target, propertyName);
      originMap.set(DecoratorManager.getDecoratorMethodKey(decoratorNameKey), data);
    } else {
      const originMap = DecoratorManager.getOriginMetadata(this.injectClassKeyPrefix, target);
      originMap.set(DecoratorManager.getDecoratorClassKey(decoratorNameKey), data);
    }
  }

  /**
   * attach data to class or property
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   */
  attachMetadata(decoratorNameKey: decoratorKey, data, target, propertyName?) {
    debug('attachMetadata %s on target %o propertyName = %s.', decoratorNameKey, target, propertyName);
    let originMap;
    let key;
    if (propertyName) {
      originMap = DecoratorManager.getOriginMetadata(this.injectMethodKeyPrefix, target, propertyName);
      key = DecoratorManager.getDecoratorMethodKey(decoratorNameKey);
    } else {
      originMap = DecoratorManager.getOriginMetadata(this.injectClassKeyPrefix, target);
      key = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
    }
    if (!originMap.has(key)) {
      originMap.set(key, []);
    }
    originMap.get(key).push(data);
  }

  /**
   * get single data from class or property
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getMetadata(decoratorNameKey: decoratorKey, target, propertyName?) {
    if (propertyName) {
      const originMap = DecoratorManager.getOriginMetadata(this.injectMethodKeyPrefix, target, propertyName);
      return originMap.get(DecoratorManager.getDecoratorMethodKey(decoratorNameKey));
    } else {
      const originMap = DecoratorManager.getOriginMetadata(this.injectClassKeyPrefix, target);
      return originMap.get(DecoratorManager.getDecoratorClassKey(decoratorNameKey));
    }
  }

  /**
   * save property data to class
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   */
  savePropertyDataToClass(decoratorNameKey: decoratorKey, data, target, propertyName) {
    debug('savePropertyDataToClass %s on target %o propertyName = %s.', decoratorNameKey, target, propertyName);
    const originMap = DecoratorManager.getOriginMetadata(this.injectClassMethodKeyPrefix, target);
    originMap.set(DecoratorManager.getDecoratorClsMethodKey(decoratorNameKey, propertyName), data);
  }

  /**
   * attach property data to class
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   */
  attachPropertyDataToClass(decoratorNameKey: decoratorKey, data, target, propertyName) {
    debug('attachPropertyDataToClass %s on target %o propertyName = %s.', decoratorNameKey, target, propertyName);
    const originMap = DecoratorManager.getOriginMetadata(this.injectClassMethodKeyPrefix, target);
    const key = DecoratorManager.getDecoratorClsMethodKey(decoratorNameKey, propertyName);
    if (!originMap.has(key)) {
      originMap.set(key, []);
    }
    originMap.get(key).push(data);
  }

  /**
   * get property data from class
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getPropertyDataFromClass(decoratorNameKey: decoratorKey, target, propertyName) {
    const originMap = DecoratorManager.getOriginMetadata(this.injectClassMethodKeyPrefix, target);
    return originMap.get(DecoratorManager.getDecoratorClsMethodKey(decoratorNameKey, propertyName));
  }

  /**
   * list property data from class
   * @param decoratorNameKey
   * @param target
   */
  listPropertyDataFromClass(decoratorNameKey: decoratorKey, target) {
    const originMap = DecoratorManager.getOriginMetadata(this.injectClassMethodKeyPrefix, target);
    const res = [];
    for (const [ key, value ] of originMap) {
      if (key.indexOf(DecoratorManager.getDecoratorClsMethodPrefix(decoratorNameKey)) !== -1) {
        res.push(value);
      }
    }
    return res;
  }
}

const manager = new DecoratorManager();

/**
 * save data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 */
export function saveClassMetadata(decoratorNameKey: decoratorKey, data, target) {
  return manager.saveMetadata(decoratorNameKey, data, target);
}

/**
 * attach data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 */
export function attachClassMetadata(decoratorNameKey: decoratorKey, data, target) {
  return manager.attachMetadata(decoratorNameKey, data, target);
}

/**
 * get data from class
 * @param decoratorNameKey
 * @param target
 */
export function getClassMetadata(decoratorNameKey: decoratorKey, target) {
  return manager.getMetadata(decoratorNameKey, target);
}

/**
 * save method data to class
 * @deprecated
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param method
 */
export function saveMethodDataToClass(decoratorNameKey: decoratorKey, data, target, method) {
  return manager.savePropertyDataToClass(decoratorNameKey, data, target, method);
}

/**
 * attach method data to class
 * @deprecated
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param method
 */
export function attachMethodDataToClass(decoratorNameKey: decoratorKey, data, target, method) {
  return manager.attachPropertyDataToClass(decoratorNameKey, data, target, method);
}

/**
 * get method data from class
 * @deprecated
 * @param decoratorNameKey
 * @param target
 * @param method
 */
export function getMethodDataFromClass(decoratorNameKey: decoratorKey, target, method) {
  return manager.getPropertyDataFromClass(decoratorNameKey, target, method);
}

/**
 * list method data from class
 * @deprecated
 * @param decoratorNameKey
 * @param target
 */
export function listMethodDataFromClass(decoratorNameKey: decoratorKey, target) {
  return manager.listPropertyDataFromClass(decoratorNameKey, target);
}

/**
 * save method data
 * @deprecated
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param method
 */
export function saveMethodMetadata(decoratorNameKey: decoratorKey, data, target, method) {
  return manager.saveMetadata(decoratorNameKey, data, target, method);
}

/**
 * attach method data
 * @deprecated
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param method
 */
export function attachMethodMetadata(decoratorNameKey: decoratorKey, data, target, method) {
  return manager.attachMetadata(decoratorNameKey, data, target, method);
}

/**
 * get method data
 * @deprecated
 * @param decoratorNameKey
 * @param target
 * @param method
 */
export function getMethodMetadata(decoratorNameKey: decoratorKey, target, method) {
  return manager.getMetadata(decoratorNameKey, target, method);
}

/**
 * save property data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export function savePropertyDataToClass(decoratorNameKey: decoratorKey, data, target, propertyName) {
  return manager.savePropertyDataToClass(decoratorNameKey, data, target, propertyName);
}

/**
 * attach property data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export function attachPropertyDataToClass(decoratorNameKey: decoratorKey, data, target, propertyName) {
  return manager.attachPropertyDataToClass(decoratorNameKey, data, target, propertyName);
}

/**
 * get property data from class
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 */
export function getPropertyDataFromClass(decoratorNameKey: decoratorKey, target, propertyName) {
  return manager.getPropertyDataFromClass(decoratorNameKey, target, propertyName);
}

/**
 * list property data from class
 * @param decoratorNameKey
 * @param target
 */
export function listPropertyDataFromClass(decoratorNameKey: decoratorKey, target) {
  return manager.listPropertyDataFromClass(decoratorNameKey, target);
}

/**
 * save property data
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export function savePropertyMetadata(decoratorNameKey: decoratorKey, data, target, propertyName) {
  return manager.saveMetadata(decoratorNameKey, data, target, propertyName);
}

/**
 * attach property data
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export function attachPropertyMetadata(decoratorNameKey: decoratorKey, data, target, propertyName) {
  return manager.attachMetadata(decoratorNameKey, data, target, propertyName);
}

/**
 * get property data
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 */
export function getPropertyMetadata(decoratorNameKey: decoratorKey, target, propertyName) {
  return manager.getMetadata(decoratorNameKey, target, propertyName);
}

/**
 * save preload module by target
 * @param target
 */
export function savePreloadModule(target) {
  return saveModule(PRELOAD_MODULE_KEY, target);
}

/**
 * list preload module
 */
export function listPreloadModule(): any[] {
  return manager.listModule(PRELOAD_MODULE_KEY);
}

/**
 * save module to inner map
 * @param decoratorNameKey
 * @param target
 */
export function saveModule(decoratorNameKey: decoratorKey, target) {
  return manager.saveModule(decoratorNameKey, target);
}

/**
 * list module from decorator key
 * @param decoratorNameKey
 */
export function listModule(decoratorNameKey: decoratorKey): any[] {
  return manager.listModule(decoratorNameKey);
}
/**
 * reset module
 * @param decoratorNameKey
 */
export function resetModule(decoratorNameKey: decoratorKey): void {
  return manager.resetModule(decoratorNameKey);
}

/**
 * clear all module
 */
export function clearAllModule() {
  return manager.clear();
}

/**
 * get parameter name from function
 * @param func
 */
export function getParamNames(func): string[] {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) {
    result = [];
  }
  return result;
}

/**
 * get provider id from module
 * @param module
 */
export function getProviderId(module): string {
  const metaData = Reflect.getMetadata(TAGGED_CLS, module) as TagClsMetadata;
  if (metaData) {
    return metaData.id;
  }
  return classNamed(module.name);
}

/**
 * get object definition metadata
 * @param module
 */
export function getObjectDefinition(module): ObjectDefinitionOptions {
  return Reflect.getMetadata(OBJ_DEF_CLS, module) as ObjectDefinitionOptions;
}
