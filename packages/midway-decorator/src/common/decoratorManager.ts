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

  static getDecoratorMethod(decoratorNameKey: decoratorKey, methodKey: decoratorKey) {
    return DecoratorManager.getDecoratorMethodKey(decoratorNameKey) + '_' + methodKey.toString();
  }

  listModule(key) {
    return Array.from(this.get(key) || {});
  }

  static saveMetadata(metaKey: string, target: any, dataKey: string, data: any) {
    debug('saveMetadata %s on target %o with dataKey = %s.', metaKey, target, dataKey);
    // filter Object.create(null)
    if (typeof target === 'object' && target.constructor) {
      target = target.constructor;
    }

    let m: Map<string, any>;
    if (Reflect.hasOwnMetadata(metaKey, target)) {
      m = Reflect.getMetadata(metaKey, target);
    } else {
      m = new Map<string, any>();
    }

    m.set(dataKey, data);
    Reflect.defineMetadata(metaKey, m, target);
  }

  static attachMetadata(metaKey: string, target: any, dataKey: string, data: any) {
    debug('attachMetadata %s on target %o with dataKey = %s.', metaKey, target, dataKey);
    // filter Object.create(null)
    if (typeof target === 'object' && target.constructor) {
      target = target.constructor;
    }

    let m: Map<string, any>;
    if (Reflect.hasOwnMetadata(metaKey, target)) {
      m = Reflect.getMetadata(metaKey, target);
    } else {
      m = new Map<string, any>();
    }

    if (!m.has(dataKey)) {
      m.set(dataKey, []);
    }
    m.get(dataKey).push(data);
    Reflect.defineMetadata(metaKey, m, target);
  }

  static getMetadata(metaKey: string, target: any, dataKey?: string) {
    debug('getMetadata %s on target %o with dataKey = %s.', metaKey, target, dataKey);
    // filter Object.create(null)
    if (typeof target === 'object' && target.constructor) {
      target = target.constructor;
    }

    let m: Map<string, any>;
    if (!Reflect.hasOwnMetadata(metaKey, target)) {
      m = new Map<string, any>();
      Reflect.defineMetadata(metaKey, m, target);
    } else {
      m = Reflect.getMetadata(metaKey, target);
    }
    if (!dataKey) {
      return m;
    }
    return m.get(dataKey);
  }

  /**
   * save meta data to class or property
   * @param decoratorNameKey the alias name for decorator
   * @param data the data you want to store
   * @param target target class
   * @param propertyName
   */
  saveMetadata(decoratorNameKey: decoratorKey, data, target, propertyName?) {
    if (propertyName) {
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey, propertyName);
      DecoratorManager.saveMetadata(this.injectMethodKeyPrefix, target, dataKey, data);
    } else {
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
      DecoratorManager.saveMetadata(this.injectClassKeyPrefix, target, dataKey, data);
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
    if (propertyName) {
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey, propertyName);
      DecoratorManager.attachMetadata(this.injectMethodKeyPrefix, target, dataKey, data);
    } else {
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
      DecoratorManager.attachMetadata(this.injectClassKeyPrefix, target, dataKey, data);
    }
  }

  /**
   * get single data from class or property
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getMetadata(decoratorNameKey: decoratorKey, target, propertyName?) {
    if (propertyName) {
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey, propertyName);
      return DecoratorManager.getMetadata(this.injectMethodKeyPrefix, target, dataKey);
    } else {
      const dataKey = `${DecoratorManager.getDecoratorClassKey(decoratorNameKey)}`;
      return DecoratorManager.getMetadata(this.injectClassKeyPrefix, target, dataKey);
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
    const dataKey = DecoratorManager.getDecoratorClsMethodKey(decoratorNameKey, propertyName);
    DecoratorManager.saveMetadata(this.injectClassMethodKeyPrefix, target, dataKey, data);
  }

  /**
   * attach property data to class
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   */
  attachPropertyDataToClass(decoratorNameKey: decoratorKey, data, target, propertyName) {
    const dataKey = DecoratorManager.getDecoratorClsMethodKey(decoratorNameKey, propertyName);
    DecoratorManager.attachMetadata(this.injectClassMethodKeyPrefix, target, dataKey, data);
  }

  /**
   * get property data from class
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getPropertyDataFromClass(decoratorNameKey: decoratorKey, target, propertyName) {
    const dataKey = DecoratorManager.getDecoratorClsMethodKey(decoratorNameKey, propertyName);
    return DecoratorManager.getMetadata(this.injectClassMethodKeyPrefix, target, dataKey);
  }

  /**
   * list property data from class
   * @param decoratorNameKey
   * @param target
   */
  listPropertyDataFromClass(decoratorNameKey: decoratorKey, target) {
    const originMap = DecoratorManager.getMetadata(this.injectClassMethodKeyPrefix, target);
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

const testKeyMap = new Map<decoratorKey, Error>();
/**
 * get data from class
 * @param decoratorNameKey
 * @param target
 */
export function getClassMetadata(decoratorNameKey: decoratorKey, target) {
  if (testKeyMap.size > 0 && testKeyMap.has(decoratorNameKey)) {
    throw testKeyMap.get(decoratorNameKey);
  }
  return manager.getMetadata(decoratorNameKey, target);
}
// TODO 因 https://github.com/microsoft/TypeScript/issues/38820 等 4.0 发布移除掉
export function throwErrorForTest(key: decoratorKey, e: Error) {
  if (e) {
    testKeyMap.set(key, e);
  } else {
    testKeyMap.delete(key);
  }
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
