import 'reflect-metadata';
import {
  ObjectDefinitionOptions,
  ObjectIdentifier,
  ReflectResult,
  TagClsMetadata,
  TagPropsMetadata,
} from '../interface';
import {
  CLASS_KEY_CONSTRUCTOR,
  INJECT_TAG,
  MAIN_MODULE_KEY,
  OBJ_DEF_CLS,
  PRIVATE_META_DATA_KEY,
  TAGGED,
  TAGGED_CLS,
  TAGGED_PROP,
} from '../constant';

import {
  DUPLICATED_INJECTABLE_DECORATOR,
  DUPLICATED_METADATA,
  INVALID_DECORATOR_OPERATION,
} from './errMsg';
import { Metadata } from './metadata';
import {
  getParamNames,
  classNamed,
  isNullOrUndefined,
  isClass,
  generateRandomId,
} from '../util';

const debug = require('util').debuglog('decorator:manager');

export type DecoratorKey = string | symbol;

export const PRELOAD_MODULE_KEY = 'INJECTION_PRELOAD_MODULE_KEY';

export const INJECT_CLASS_KEY_PREFIX = 'INJECTION_CLASS_META_DATA';

export const MODULE_MAPPING_PREFIX = 'MODULE_MAPPING_PREFIX';

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

  static getDecoratorClassKey(decoratorNameKey: DecoratorKey) {
    return decoratorNameKey.toString() + '_CLS';
  }

  static removeDecoratorClassKeySuffix(decoratorNameKey: DecoratorKey) {
    return decoratorNameKey.toString().replace('_CLS', '');
  }

  static getDecoratorMethodKey(decoratorNameKey: DecoratorKey) {
    return decoratorNameKey.toString() + '_METHOD';
  }

  static getDecoratorClsExtendedKey(decoratorNameKey: DecoratorKey) {
    return decoratorNameKey.toString() + '_EXT';
  }

  static getDecoratorClsMethodPrefix(decoratorNameKey: DecoratorKey) {
    return decoratorNameKey.toString() + '_CLS_METHOD';
  }

  static getDecoratorClsMethodKey(
    decoratorNameKey: DecoratorKey,
    methodKey: DecoratorKey
  ) {
    return (
      DecoratorManager.getDecoratorClsMethodPrefix(decoratorNameKey) +
      ':' +
      methodKey.toString()
    );
  }

  static getDecoratorMethod(
    decoratorNameKey: DecoratorKey,
    methodKey: DecoratorKey
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
  saveMetadata(decoratorNameKey: DecoratorKey, data, target, propertyName?) {
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
   */
  attachMetadata(
    decoratorNameKey: DecoratorKey,
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
  getMetadata(decoratorNameKey: DecoratorKey, target, propertyName?) {
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
    decoratorNameKey: DecoratorKey,
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
    decoratorNameKey: DecoratorKey,
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
    decoratorNameKey: DecoratorKey,
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
  listPropertyDataFromClass(decoratorNameKey: DecoratorKey, target) {
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
 */
export function saveClassMetadata(
  decoratorNameKey: DecoratorKey,
  data,
  target
) {
  return manager.saveMetadata(decoratorNameKey, data, target);
}

/**
 * attach data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param groupBy
 */
export function attachClassMetadata(
  decoratorNameKey: DecoratorKey,
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

const testKeyMap = new Map<DecoratorKey, Error>();

/**
 * get data from class assign
 * @param decoratorNameKey
 * @param target
 */
export function getClassExtendedMetadata(
  decoratorNameKey: DecoratorKey,
  target
) {
  const extKey = DecoratorManager.getDecoratorClsExtendedKey(decoratorNameKey);
  let metadata = manager.getMetadata(extKey, target);
  if (metadata !== undefined) {
    return metadata;
  }
  const father = Reflect.getPrototypeOf(target);
  if (father.constructor !== Object) {
    metadata = mergeMeta(
      getClassExtendedMetadata(decoratorNameKey, father),
      manager.getMetadata(decoratorNameKey, target)
    );
  }
  manager.saveMetadata(extKey, metadata || null, target);
  return metadata;
}

function mergeMeta(target: any, src: any) {
  if (!target) {
    target = src;
    src = null;
  }
  if (!target) {
    return null;
  }
  if (Array.isArray(target)) {
    return target.concat(src || []);
  }
  if (typeof target === 'object') {
    return Object.assign({}, target, src);
  }
  throw new Error('can not merge meta that type of ' + typeof target);
}

/**
 * get data from class
 * @param decoratorNameKey
 * @param target
 */
export function getClassMetadata(decoratorNameKey: DecoratorKey, target) {
  if (testKeyMap.size > 0 && testKeyMap.has(decoratorNameKey)) {
    throw testKeyMap.get(decoratorNameKey);
  }
  return manager.getMetadata(decoratorNameKey, target);
}

/**
 * this method has deprecated and use savePropertyDataToClass instead
 *
 * @deprecated
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param method
 */
export function saveMethodDataToClass(
  decoratorNameKey: DecoratorKey,
  data,
  target,
  method
) {
  return manager.savePropertyDataToClass(
    decoratorNameKey,
    data,
    target,
    method
  );
}

/**
 * this method has deprecated and use attachPropertyDataToClass instead
 *
 * @deprecated
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param method
 */
export function attachMethodDataToClass(
  decoratorNameKey: DecoratorKey,
  data,
  target,
  method
) {
  return manager.attachPropertyDataToClass(
    decoratorNameKey,
    data,
    target,
    method
  );
}

/**
 * this method has deprecated and use getPropertyDataFromClass instead
 *
 * @deprecated
 * @param decoratorNameKey
 * @param target
 * @param method
 */
export function getMethodDataFromClass(
  decoratorNameKey: DecoratorKey,
  target,
  method
) {
  return manager.getPropertyDataFromClass(decoratorNameKey, target, method);
}

/**
 * list method data from class
 * @deprecated
 * @param decoratorNameKey
 * @param target
 */
export function listMethodDataFromClass(
  decoratorNameKey: DecoratorKey,
  target
) {
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
export function saveMethodMetadata(
  decoratorNameKey: DecoratorKey,
  data,
  target,
  method
) {
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
export function attachMethodMetadata(
  decoratorNameKey: DecoratorKey,
  data,
  target,
  method
) {
  return manager.attachMetadata(decoratorNameKey, data, target, method);
}

/**
 * get method data
 * @deprecated
 * @param decoratorNameKey
 * @param target
 * @param method
 */
export function getMethodMetadata(
  decoratorNameKey: DecoratorKey,
  target,
  method
) {
  return manager.getMetadata(decoratorNameKey, target, method);
}

/**
 * save property data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export function savePropertyDataToClass(
  decoratorNameKey: DecoratorKey,
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
  decoratorNameKey: DecoratorKey,
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
  decoratorNameKey: DecoratorKey,
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
  decoratorNameKey: DecoratorKey,
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
  decoratorNameKey: DecoratorKey,
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
  decoratorNameKey: DecoratorKey,
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
  decoratorNameKey: DecoratorKey,
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
export function saveModule(decoratorNameKey: DecoratorKey, target) {
  return manager.saveModule(decoratorNameKey, target);
}

/**
 * list module from decorator key
 * @param decoratorNameKey
 */
export function listModule(
  decoratorNameKey: DecoratorKey,
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
export function resetModule(decoratorNameKey: DecoratorKey): void {
  return manager.resetModule(decoratorNameKey);
}

/**
 * clear all module
 */
export function clearAllModule() {
  return manager.clear();
}

/**
 * get provider id from module
 * @param module
 */
export function getProviderId(module): string {
  const metaData = Reflect.getMetadata(TAGGED_CLS, module) as TagClsMetadata;
  let providerId;
  if (metaData) {
    providerId = metaData.id;
  } else {
    providerId = classNamed(module.name);
  }

  const meta = getClassMetadata(PRIVATE_META_DATA_KEY, module);
  if (providerId && meta) {
    providerId = generateProvideId(providerId, meta.namespace);
  }

  return providerId;
}

export function getProviderUUId(module): string {
  const metaData = Reflect.getMetadata(TAGGED_CLS, module) as TagClsMetadata;
  if (metaData && metaData.uuid) {
    return metaData.uuid;
  }
}

/**
 * 生成带 namespace 的 provideId
 * @param provideId provideId
 * @param namespace namespace
 */
export function generateProvideId(provideId: string, namespace?: string) {
  // 如果是 uuid，直接返回
  if (!hasIdentifierMapping(provideId)) {
    return provideId;
  }
  if (namespace && namespace !== MAIN_MODULE_KEY) {
    if (provideId.includes('@')) {
      return provideId.substr(1);
    }
    if (provideId.includes(':')) {
      return provideId;
    }
    if (namespace.includes('@')) {
      namespace = namespace.substr(1);
    }
    return namespace + ':' + provideId;
  }
  return provideId;
}

/**
 * get object definition metadata
 * @param module
 */
export function getObjectDefinition(module): ObjectDefinitionOptions {
  return Reflect.getMetadata(OBJ_DEF_CLS, module) as ObjectDefinitionOptions;
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
 * get parameters type by reflect-metadata
 */
export function getMethodParamTypes(target, propertyKey: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', target, propertyKey);
}

export function getPropertyType(target, propertyKey: string | symbol) {
  return transformTypeFromTSDesign(
    Reflect.getMetadata('design:type', target, propertyKey)
  );
}

export function getMethodReturnTypes(target, propertyKey: string | symbol) {
  return Reflect.getMetadata('design:returntype', target, propertyKey);
}

function _tagParameterOrProperty(
  metadataKey: string,
  annotationTarget: any,
  propertyName: string,
  metadata: TagPropsMetadata,
  parameterIndex?: number
) {
  let paramsOrPropertiesMetadata: ReflectResult = {};
  const isParameterDecorator = typeof parameterIndex === 'number';
  const key: string =
    parameterIndex !== undefined && isParameterDecorator
      ? parameterIndex.toString()
      : propertyName;

  // if the decorator is used as a parameter decorator, the property name must be provided
  if (isParameterDecorator && propertyName !== undefined) {
    throw new Error(INVALID_DECORATOR_OPERATION);
  }

  // read metadata if available
  if (Reflect.hasOwnMetadata(metadataKey, annotationTarget)) {
    paramsOrPropertiesMetadata = Reflect.getMetadata(
      metadataKey,
      annotationTarget
    );
  }

  // get metadata for the decorated parameter by its index
  let paramOrPropertyMetadata: TagPropsMetadata[] =
    paramsOrPropertiesMetadata[key];

  if (!Array.isArray(paramOrPropertyMetadata)) {
    paramOrPropertyMetadata = [];
  } else {
    for (const m of paramOrPropertyMetadata) {
      if (m.key === metadata.key) {
        throw new Error(`${DUPLICATED_METADATA} ${m.key.toString()}`);
      }
    }
  }

  // set metadata
  paramOrPropertyMetadata.push(metadata);
  paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata;
  Reflect.defineMetadata(
    metadataKey,
    paramsOrPropertiesMetadata,
    annotationTarget
  );
}

export function attachConstructorDataOnClass(identifier, clz, type, index) {
  if (!identifier) {
    const args = getParamNames(clz);
    if (clz.length === args.length && index < clz.length) {
      identifier = args[index];
    }
  }

  // save constructor index on class
  let constructorMetaValue = getClassMetadata(CLASS_KEY_CONSTRUCTOR, clz);
  if (!constructorMetaValue) {
    constructorMetaValue = {};
  }
  constructorMetaValue[index] = {
    key: identifier,
    type,
  };
  saveClassMetadata(CLASS_KEY_CONSTRUCTOR, constructorMetaValue, clz);
}

interface InjectOptions {
  identifier: ObjectIdentifier;
  target: any;
  targetKey: string;
  index?: number;
  args?: any;
}
/**
 * 构造器注入
 * @param opts 参数
 */
export function saveConstructorInject(opts: InjectOptions) {
  let identifier = opts.identifier;
  if (!identifier) {
    const args = getParamNames(opts.target);
    if (opts.target.length === args.length && opts.index < opts.target.length) {
      identifier = args[opts.index];
    }
  } else if (identifier.includes('@') && !identifier.includes(':')) {
    const args = getParamNames(opts.target);
    if (opts.target.length === args.length && opts.index < opts.target.length) {
      identifier = `${identifier}:${args[opts.index]}`;
    }
  }
  const metadata = new Metadata(INJECT_TAG, identifier);
  metadata.args = opts.args;
  _tagParameterOrProperty(
    TAGGED,
    opts.target,
    opts.targetKey,
    metadata,
    opts.index
  );
}

export function getConstructorInject(target: any): TagPropsMetadata[] {
  return Reflect.getMetadata(TAGGED, target);
}
/**
 * 属性注入
 * @param opts 参数
 */
export function savePropertyInject(opts: InjectOptions) {
  let identifier = opts.identifier;
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
      identifier = opts.targetKey;
    }
  }
  if (identifier.includes('@') && !identifier.includes(':')) {
    identifier = `${identifier}:${opts.targetKey}`;
  }
  const metadata = new Metadata(INJECT_TAG, identifier);
  metadata.args = opts.args;
  _tagParameterOrProperty(
    TAGGED_PROP,
    opts.target.constructor,
    opts.targetKey,
    metadata
  );
}

export function getPropertyInject(target: any): TagPropsMetadata[] {
  return Reflect.getMetadata(TAGGED_PROP, target);
}
/**
 * class 元数据定义
 * @param target class
 * @param props 属性
 */
export function saveObjectDefProps(target: any, props = {}) {
  if (Reflect.hasMetadata(OBJ_DEF_CLS, target)) {
    const originProps = Reflect.getMetadata(OBJ_DEF_CLS, target);

    Reflect.defineMetadata(
      OBJ_DEF_CLS,
      Object.assign(originProps, props),
      target
    );
  } else {
    Reflect.defineMetadata(OBJ_DEF_CLS, props, target);
  }
  return target;
}

export function getObjectDefProps(target: any): ObjectDefinitionOptions {
  return Reflect.getMetadata(OBJ_DEF_CLS, target);
}

/**
 * save identifier and uuid relationship
 * @param identifier
 * @param uuid
 */
export function saveIdentifierMapping(identifier, uuid) {
  return manager.saveIdentifierMapping(identifier, uuid);
}

/**
 * get uuid from identifier
 * @param identifier
 */
export function getIdentifierMapping(identifier) {
  return manager.getIdentifierMapping(identifier);
}

/**
 * find identifier mapping exists
 * @param identifier
 */
export function hasIdentifierMapping(identifier) {
  return manager.hasIdentifierMapping(identifier);
}

/**
 * class provider id
 * @param identifier id
 * @param target class
 * @param override 是否覆盖
 */
export function saveProviderId(
  identifier: ObjectIdentifier,
  target: any,
  override?: boolean
) {
  if (Reflect.hasOwnMetadata(TAGGED_CLS, target) && !override) {
    throw new Error(DUPLICATED_INJECTABLE_DECORATOR);
  }

  if (!identifier) {
    identifier = classNamed(target.name);
  }

  const uuid = generateRandomId();
  // save identifier and uuid relationship
  manager.saveIdentifierMapping(identifier, uuid);

  Reflect.defineMetadata(
    TAGGED_CLS,
    {
      id: identifier,
      originName: target.name,
      uuid,
    },
    target
  );

  if (!Reflect.hasMetadata(OBJ_DEF_CLS, target)) {
    Reflect.defineMetadata(OBJ_DEF_CLS, {}, target);
  }

  return target;
}
/**
 * 是否使用了 saveProviderId
 * @param target class
 */
export function isProvide(target: any): boolean {
  return Reflect.hasOwnMetadata(TAGGED_CLS, target);
}
