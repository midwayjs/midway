import 'reflect-metadata';
import {
  ObjectDefinitionOptions,
  ObjectIdentifier,
  TagClsMetadata,
  TagPropsMetadata,
} from './interface';
import { INJECT_TAG, OBJ_DEF_CLS, TAGGED_CLS } from './constant';

import {
  isNullOrUndefined,
  isClass,
  generateRandomId,
  classNamed,
  merge,
} from './util';

const debug = require('util').debuglog('decorator:manager');

export const PRELOAD_MODULE_KEY = 'INJECTION_PRELOAD_MODULE_KEY';

export const INJECT_CLASS_KEY_PREFIX = 'INJECTION_CLASS_META_DATA';

export class DecoratorManager extends Map {
  /**
   * the key for meta data store in class
   */
  injectClassKeyPrefix = INJECT_CLASS_KEY_PREFIX;
  /**
   * the key for method meta data store in class
   */
  injectClassMethodKeyPrefix = 'INJECTION_CLASS_METHOD_META_DATA';

  /**
   * the key for method meta data store in method
   */
  injectMethodKeyPrefix = 'INJECTION_METHOD_META_DATA';

  identifierUUIDRelationShipMapping = new Map();

  saveIdentifierMapping(identifier, uuid) {
    if (identifier !== uuid) {
      return this.identifierUUIDRelationShipMapping.set(identifier, uuid);
    }
  }

  getIdentifierMapping(identifier) {
    return this.identifierUUIDRelationShipMapping.get(identifier);
  }

  hasIdentifierMapping(identifier) {
    return this.identifierUUIDRelationShipMapping.has(identifier);
  }

  saveModule(key, module) {
    if (!this.has(key)) {
      this.set(key, new Set());
    }
    this.get(key).add(module);
  }

  resetModule(key) {
    this.set(key, new Set());
  }

  clear() {
    this.identifierUUIDRelationShipMapping.clear();
    super.clear();
  }

  static getDecoratorClassKey(decoratorNameKey: ObjectIdentifier) {
    return decoratorNameKey.toString() + '_CLS';
  }

  static removeDecoratorClassKeySuffix(decoratorNameKey: ObjectIdentifier) {
    return decoratorNameKey.toString().replace('_CLS', '');
  }

  static getDecoratorMethodKey(decoratorNameKey: ObjectIdentifier) {
    return decoratorNameKey.toString() + '_METHOD';
  }

  static getDecoratorClsExtendedKey(decoratorNameKey: ObjectIdentifier) {
    return decoratorNameKey.toString() + '_EXT';
  }

  static getDecoratorClsMethodPrefix(decoratorNameKey: ObjectIdentifier) {
    return decoratorNameKey.toString() + '_CLS_METHOD';
  }

  static getDecoratorClsMethodKey(
    decoratorNameKey: ObjectIdentifier,
    methodKey: ObjectIdentifier
  ) {
    return (
      DecoratorManager.getDecoratorClsMethodPrefix(decoratorNameKey) +
      ':' +
      methodKey.toString()
    );
  }

  static getDecoratorMethod(
    decoratorNameKey: ObjectIdentifier,
    methodKey: ObjectIdentifier
  ) {
    return (
      DecoratorManager.getDecoratorMethodKey(decoratorNameKey) +
      '_' +
      methodKey.toString()
    );
  }

  listModule(key) {
    return Array.from(this.get(key) || {});
  }

  static saveMetadata(
    metaKey: string,
    target: any,
    dataKey: string,
    data: any
  ) {
    debug(
      'saveMetadata %s on target %o with dataKey = %s.',
      metaKey,
      target,
      dataKey
    );
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

  static attachMetadata(
    metaKey: string,
    target: any,
    dataKey: string,
    data: any,
    groupBy?: string
  ) {
    debug(
      'attachMetadata %s on target %o with dataKey = %s.',
      metaKey,
      target,
      dataKey
    );
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
      if (groupBy) {
        m.set(dataKey, {});
      } else {
        m.set(dataKey, []);
      }
    }
    if (groupBy) {
      m.get(dataKey)[groupBy] = data;
    } else {
      m.get(dataKey).push(data);
    }
    Reflect.defineMetadata(metaKey, m, target);
  }

  static getMetadata(metaKey: string, target: any, dataKey?: string) {
    debug(
      'getMetadata %s on target %o with dataKey = %s.',
      metaKey,
      target,
      dataKey
    );
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
  saveMetadata(
    decoratorNameKey: ObjectIdentifier,
    data,
    target,
    propertyName?
  ) {
    if (propertyName) {
      const dataKey = DecoratorManager.getDecoratorMethod(
        decoratorNameKey,
        propertyName
      );
      DecoratorManager.saveMetadata(
        this.injectMethodKeyPrefix,
        target,
        dataKey,
        data
      );
    } else {
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
      DecoratorManager.saveMetadata(
        this.injectClassKeyPrefix,
        target,
        dataKey,
        data
      );
    }
  }

  /**
   * attach data to class or property
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   * @param groupBy
   */
  attachMetadata(
    decoratorNameKey: ObjectIdentifier,
    data,
    target,
    propertyName?: string,
    groupBy?: string
  ) {
    if (propertyName) {
      const dataKey = DecoratorManager.getDecoratorMethod(
        decoratorNameKey,
        propertyName
      );
      DecoratorManager.attachMetadata(
        this.injectMethodKeyPrefix,
        target,
        dataKey,
        data,
        groupBy
      );
    } else {
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
      DecoratorManager.attachMetadata(
        this.injectClassKeyPrefix,
        target,
        dataKey,
        data,
        groupBy
      );
    }
  }

  /**
   * get single data from class or property
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getMetadata(decoratorNameKey: ObjectIdentifier, target, propertyName?) {
    if (propertyName) {
      const dataKey = DecoratorManager.getDecoratorMethod(
        decoratorNameKey,
        propertyName
      );
      return DecoratorManager.getMetadata(
        this.injectMethodKeyPrefix,
        target,
        dataKey
      );
    } else {
      const dataKey = `${DecoratorManager.getDecoratorClassKey(
        decoratorNameKey
      )}`;
      return DecoratorManager.getMetadata(
        this.injectClassKeyPrefix,
        target,
        dataKey
      );
    }
  }

  /**
   * save property data to class
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   */
  savePropertyDataToClass(
    decoratorNameKey: ObjectIdentifier,
    data,
    target,
    propertyName
  ) {
    const dataKey = DecoratorManager.getDecoratorClsMethodKey(
      decoratorNameKey,
      propertyName
    );
    DecoratorManager.saveMetadata(
      this.injectClassMethodKeyPrefix,
      target,
      dataKey,
      data
    );
  }

  /**
   * attach property data to class
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   * @param groupBy
   */
  attachPropertyDataToClass(
    decoratorNameKey: ObjectIdentifier,
    data,
    target,
    propertyName,
    groupBy?: string
  ) {
    const dataKey = DecoratorManager.getDecoratorClsMethodKey(
      decoratorNameKey,
      propertyName
    );
    DecoratorManager.attachMetadata(
      this.injectClassMethodKeyPrefix,
      target,
      dataKey,
      data,
      groupBy
    );
  }

  /**
   * get property data from class
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getPropertyDataFromClass(
    decoratorNameKey: ObjectIdentifier,
    target,
    propertyName
  ) {
    const dataKey = DecoratorManager.getDecoratorClsMethodKey(
      decoratorNameKey,
      propertyName
    );
    return DecoratorManager.getMetadata(
      this.injectClassMethodKeyPrefix,
      target,
      dataKey
    );
  }

  /**
   * list property data from class
   * @param decoratorNameKey
   * @param target
   */
  listPropertyDataFromClass(decoratorNameKey: ObjectIdentifier, target) {
    const originMap = DecoratorManager.getMetadata(
      this.injectClassMethodKeyPrefix,
      target
    );
    const res = [];
    for (const [key, value] of originMap) {
      if (
        key.indexOf(
          DecoratorManager.getDecoratorClsMethodPrefix(decoratorNameKey)
        ) !== -1
      ) {
        res.push(value);
      }
    }
    return res;
  }
}

let manager = new DecoratorManager();
if (global['MIDWAY_GLOBAL_DECORATOR_MANAGER']) {
  console.warn(
    'DecoratorManager not singleton and please check @midwayjs/decorator version by "npm ls @midwayjs/decorator"'
  );
  manager = global['MIDWAY_GLOBAL_DECORATOR_MANAGER'];
} else {
  global['MIDWAY_GLOBAL_DECORATOR_MANAGER'] = manager;
}

/**
 * save data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param mergeIfExist
 */
export function saveClassMetadata(
  decoratorNameKey: ObjectIdentifier,
  data: any,
  target: any,
  mergeIfExist?: boolean
) {
  if (mergeIfExist && typeof data === 'object') {
    const originData = manager.getMetadata(decoratorNameKey, target);
    if (!originData) {
      return manager.saveMetadata(decoratorNameKey, data, target);
    }
    if (Array.isArray(originData)) {
      return manager.saveMetadata(
        decoratorNameKey,
        originData.concat(data),
        target
      );
    } else {
      return manager.saveMetadata(
        decoratorNameKey,
        Object.assign(originData, data),
        target
      );
    }
  } else {
    return manager.saveMetadata(decoratorNameKey, data, target);
  }
}

/**
 * attach data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param groupBy
 */
export function attachClassMetadata(
  decoratorNameKey: ObjectIdentifier,
  data: any,
  target,
  groupBy?: string
) {
  return manager.attachMetadata(
    decoratorNameKey,
    data,
    target,
    undefined,
    groupBy
  );
}

/**
 * get data from class and proto
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 * @param useCache
 */
export function getClassExtendedMetadata(
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName?: string,
  useCache?: boolean
) {
  if (useCache === undefined) {
    useCache = true;
  }
  const extKey = DecoratorManager.getDecoratorClsExtendedKey(decoratorNameKey);
  let metadata = manager.getMetadata(extKey, target, propertyName);
  if (useCache && metadata !== undefined) {
    return metadata;
  }
  const father = Reflect.getPrototypeOf(target);
  if (father && father.constructor !== Object) {
    metadata = merge(
      getClassExtendedMetadata(
        decoratorNameKey,
        father,
        propertyName,
        useCache
      ),
      manager.getMetadata(decoratorNameKey, target, propertyName)
    );
  }
  manager.saveMetadata(extKey, metadata || null, target, propertyName);
  return metadata;
}

/**
 * get data from class
 * @param decoratorNameKey
 * @param target
 */
export function getClassMetadata(decoratorNameKey: ObjectIdentifier, target) {
  return manager.getMetadata(decoratorNameKey, target);
}

/**
 * save property data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export function savePropertyDataToClass(
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) {
  return manager.savePropertyDataToClass(
    decoratorNameKey,
    data,
    target,
    propertyName
  );
}

/**
 * attach property data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 * @param groupBy
 */
export function attachPropertyDataToClass(
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName,
  groupBy?: string
) {
  return manager.attachPropertyDataToClass(
    decoratorNameKey,
    data,
    target,
    propertyName,
    groupBy
  );
}

/**
 * get property data from class
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 */
export function getPropertyDataFromClass(
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName
) {
  return manager.getPropertyDataFromClass(
    decoratorNameKey,
    target,
    propertyName
  );
}

/**
 * list property data from class
 * @param decoratorNameKey
 * @param target
 */
export function listPropertyDataFromClass(
  decoratorNameKey: ObjectIdentifier,
  target
) {
  return manager.listPropertyDataFromClass(decoratorNameKey, target);
}

/**
 * save property data
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export function savePropertyMetadata(
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) {
  return manager.saveMetadata(decoratorNameKey, data, target, propertyName);
}

/**
 * attach property data
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export function attachPropertyMetadata(
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) {
  return manager.attachMetadata(decoratorNameKey, data, target, propertyName);
}

/**
 * get property data
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 */
export function getPropertyMetadata(
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName
) {
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
  return listModule(PRELOAD_MODULE_KEY);
}

/**
 * save module to inner map
 * @param decoratorNameKey
 * @param target
 */
export function saveModule(decoratorNameKey: ObjectIdentifier, target) {
  return manager.saveModule(decoratorNameKey, target);
}

/**
 * list module from decorator key
 * @param decoratorNameKey
 * @param filter
 */
export function listModule(
  decoratorNameKey: ObjectIdentifier,
  filter?: (module) => boolean
): any[] {
  const modules = manager.listModule(decoratorNameKey);
  if (filter) {
    return modules.filter(filter);
  } else {
    return modules;
  }
}

/**
 * reset module
 * @param decoratorNameKey
 */
export function resetModule(decoratorNameKey: ObjectIdentifier): void {
  return manager.resetModule(decoratorNameKey);
}

/**
 * clear all module
 */
export function clearAllModule() {
  return manager.clear();
}

export interface TSDesignType {
  name: string;
  originDesign: any;
  isBaseType: boolean;
}

function transformTypeFromTSDesign(designFn): TSDesignType {
  if (isNullOrUndefined(designFn)) {
    return { name: 'undefined', isBaseType: true, originDesign: designFn };
  }

  switch (designFn.name) {
    case 'String':
      return { name: 'string', isBaseType: true, originDesign: designFn };
    case 'Number':
      return { name: 'number', isBaseType: true, originDesign: designFn };
    case 'Boolean':
      return { name: 'boolean', isBaseType: true, originDesign: designFn };
    case 'Symbol':
      return { name: 'symbol', isBaseType: true, originDesign: designFn };
    case 'Object':
      return { name: 'object', isBaseType: true, originDesign: designFn };
    case 'Function':
      return { name: 'function', isBaseType: true, originDesign: designFn };
    default:
      return {
        name: designFn.name,
        isBaseType: false,
        originDesign: designFn,
      };
  }
}

/**
 * save property inject args
 * @param opts 参数
 */
export function savePropertyInject(opts: {
  // id
  identifier: ObjectIdentifier;
  // class
  target: any;
  // propertyName
  targetKey: string;
  args?: any;
}) {
  // 1、use identifier by user
  let identifier = opts.identifier;
  // 2、use identifier by class uuid
  if (!identifier) {
    const type = getPropertyType(opts.target, opts.targetKey);
    if (
      !type.isBaseType &&
      isClass(type.originDesign) &&
      isProvide(type.originDesign)
    ) {
      identifier = getProviderUUId(type.originDesign);
    }
    if (!identifier) {
      // 3、use identifier by property name
      identifier = opts.targetKey;
    }
  }
  attachClassMetadata(
    INJECT_TAG,
    {
      targetKey: opts.targetKey, // 注入的属性名
      value: identifier, // 注入的 id
      args: opts.args, // 注入的其他参数
    },
    opts.target,
    opts.targetKey
  );
}

/**
 * get property inject args
 * @param target
 * @param useCache
 */
export function getPropertyInject(
  target: any,
  useCache?: boolean
): {
  [methodName: string]: TagPropsMetadata;
} {
  return getClassExtendedMetadata(INJECT_TAG, target, undefined, useCache);
}

/**
 * save class object definition
 * @param target class
 * @param props property data
 */
export function saveObjectDefinition(target: any, props = {}) {
  saveClassMetadata(OBJ_DEF_CLS, props, target, true);
  return target;
}

/**
 * get class object definition from metadata
 * @param target
 */
export function getObjectDefinition(target: any): ObjectDefinitionOptions {
  return getClassExtendedMetadata(OBJ_DEF_CLS, target);
}

/**
 * class provider id
 * @param identifier id
 * @param target class
 */
export function saveProviderId(identifier: ObjectIdentifier, target: any) {
  const uuid = generateRandomId();
  // save class id and uuid
  saveClassMetadata(
    TAGGED_CLS,
    {
      id: identifier,
      originName: target.name,
      uuid,
      name: classNamed(target.name),
    },
    target
  );

  return target;
}
/**
 * get provider id from module
 * @param module
 */
export function getProviderId(module): string {
  const metaData = getClassMetadata(TAGGED_CLS, module) as TagClsMetadata;
  if (metaData && metaData.id) {
    return metaData.id;
  }
}

export function getProviderName(module): string {
  const metaData = getClassMetadata(TAGGED_CLS, module) as TagClsMetadata;
  if (metaData && metaData.name) {
    return metaData.name;
  }
}

/**
 * get provider uuid from module
 * @param module
 */
export function getProviderUUId(module): string {
  const metaData = getClassMetadata(TAGGED_CLS, module) as TagClsMetadata;
  if (metaData && metaData.uuid) {
    return metaData.uuid;
  }
}
/**
 * use @Provide decorator or not
 * @param target class
 */
export function isProvide(target: any): boolean {
  return !!getClassMetadata(TAGGED_CLS, target);
}

/**
 * get parameters type by reflect-metadata
 */
export function getMethodParamTypes(target, methodName: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', target, methodName);
}

/**
 * get property(method) type from metadata
 * @param target
 * @param methodName
 */
export function getPropertyType(target, methodName: string | symbol) {
  return transformTypeFromTSDesign(
    Reflect.getMetadata('design:type', target, methodName)
  );
}

/**
 * get method return type from metadata
 * @param target
 * @param methodName
 */
export function getMethodReturnTypes(target, methodName: string | symbol) {
  return Reflect.getMetadata('design:returntype', target, methodName);
}

/**
 * 以数组形式返回所有原型，数组第一个元素是距离 o 最近的原型
 * @param target 对象，class 或者 function
 */
export function recursiveGetPrototypeOf(target: any): any[] {
  const properties = [];
  let parent = Reflect.getPrototypeOf(target);
  while (parent !== null) {
    properties.push(parent);
    parent = Reflect.getPrototypeOf(parent);
  }
  return properties;
}
