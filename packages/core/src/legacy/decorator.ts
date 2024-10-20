import {
  MethodDecoratorOptions,
  ObjectDefinitionOptions,
  ObjectIdentifier,
  ParamDecoratorOptions,
  TagPropsMetadata,
} from '../interface';
import { MetadataManager } from '../decorator/metadataManager';
import { DecoratorManager, PROPERTY_INJECT_KEY, SCOPE_KEY } from '../decorator';
import { saveInjectMetadata } from '../decorator/common/inject';
import { OBJ_DEF_CLS } from './constants';

/**
 * the key for attach and list property data from class
 */
const legacyListPropertyDataKey = 'LEGACY_LIST_PROPERTY_DATA_KEY';

function getDecoratorClsMethodPrefix(decoratorNameKey: ObjectIdentifier) {
  return decoratorNameKey.toString() + '_CLS_METHOD';
}

function getDecoratorClsMethodKey(
  decoratorNameKey: ObjectIdentifier,
  methodKey: ObjectIdentifier
) {
  return (
    getDecoratorClsMethodPrefix(decoratorNameKey) + ':' + methodKey.toString()
  );
}

/**
 * save data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param mergeIfExist
 * @since 2.3.0
 * @deprecated Use MetadataManager.defineMetadata instead
 */
export function saveClassMetadata(
  decoratorNameKey: ObjectIdentifier,
  data: any,
  target: any,
  mergeIfExist?: boolean
) {
  if (mergeIfExist && typeof data === 'object') {
    const originData = MetadataManager.getMetadata(
      decoratorNameKey as any,
      target
    );
    if (!originData) {
      return MetadataManager.defineMetadata(
        decoratorNameKey as any,
        data,
        target
      );
    }
    if (Array.isArray(originData)) {
      return MetadataManager.defineMetadata(
        decoratorNameKey as any,
        originData.concat(data),
        target
      );
    } else {
      return MetadataManager.defineMetadata(
        decoratorNameKey as any,
        Object.assign(originData, data),
        target
      );
    }
  }
  return MetadataManager.defineMetadata(
    decoratorNameKey as string | symbol,
    data,
    target
  );
}

/**
 * attach data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param groupBy
 * @since 2.3.0
 * @deprecated Use MetadataManager.attachMetadata instead
 */
export function attachClassMetadata(
  decoratorNameKey: ObjectIdentifier,
  data: any,
  target,
  groupBy?: string
) {
  return MetadataManager.attachMetadata(
    decoratorNameKey as string | symbol,
    data,
    target,
    groupBy
  );
}

function _getClassExtendedMetadata<T = any>(
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName?: string,
  useCache?: boolean
): T {
  const ret = MetadataManager.getPropertiesWithMetadata(
    decoratorNameKey as string | symbol,
    target
  ) as T;

  // array item to object
  const res = {} as any;
  for (const key in ret) {
    const element = ret[key];
    if (Array.isArray(element) && element.length) {
      res[key] = element[element.length - 1];
    } else {
      res[key] = element;
    }
  }
  return res;
}

/**
 * get data from class and proto
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 * @param useCache
 * @since 2.3.0
 * @deprecated Use MetadataManager.getMetadata instead
 */
export function getClassExtendedMetadata<T = any>(
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName?: string,
  useCache?: boolean
): T {
  const ret = MetadataManager.getMetadata(decoratorNameKey as any, target);
  if (ret === undefined) {
    const res = _getClassExtendedMetadata(
      decoratorNameKey,
      target,
      propertyName,
      useCache
    );
    if (res) {
      return res;
    }
  }
  return ret;
}

/**
 * get data from class
 * @param decoratorNameKey
 * @param target
 * @since 2.3.0
 * @deprecated Use MetadataManager.getOwnMetadata instead
 */
export function getClassMetadata<T = any>(
  decoratorNameKey: ObjectIdentifier,
  target
): T {
  return MetadataManager.getOwnMetadata<T>(
    decoratorNameKey as string | symbol,
    target
  );
}

/**
 * save property data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 * @since 2.3.0
 * @deprecated Use MetadataManager.defineMetadata instead
 */
export function savePropertyDataToClass(
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) {
  const dataKey = getDecoratorClsMethodKey(decoratorNameKey, propertyName);
  const originMap =
    MetadataManager.getOwnMetadata(legacyListPropertyDataKey, target) ||
    new Map();

  originMap.set(dataKey, data);

  return MetadataManager.defineMetadata(
    legacyListPropertyDataKey as string | symbol,
    originMap,
    target
  );
}

/**
 * attach property data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 * @since 2.3.0
 * @deprecated
 */
export function attachPropertyDataToClass(
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) {
  const dataKey = getDecoratorClsMethodKey(decoratorNameKey, propertyName);
  const originMap =
    MetadataManager.getOwnMetadata(legacyListPropertyDataKey, target) ||
    new Map();

  if (originMap.has(dataKey)) {
    const ret = originMap.get(dataKey);
    ret.push(data);
    originMap.set(dataKey, ret);
  } else {
    originMap.set(dataKey, [data]);
  }

  return MetadataManager.defineMetadata(
    legacyListPropertyDataKey as string | symbol,
    originMap,
    target
  );
}

/**
 * get property data from class
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 * @since 2.3.0
 * @deprecated Use MetadataManager.getOwnMetadata instead
 */
export function getPropertyDataFromClass<T = any>(
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName
): T {
  const dataKey = getDecoratorClsMethodKey(decoratorNameKey, propertyName);
  const originMap = MetadataManager.getOwnMetadata(
    legacyListPropertyDataKey as string | symbol,
    target
  );
  return originMap && originMap.get(dataKey);
}

/**
 * list property data from class
 * @param decoratorNameKey
 * @param target
 * @since 2.3.0
 * @deprecated
 */
export function listPropertyDataFromClass(
  decoratorNameKey: ObjectIdentifier,
  target
) {
  const originMap = MetadataManager.getOwnMetadata(
    legacyListPropertyDataKey,
    target
  );
  const res = [];
  const prefix = getDecoratorClsMethodPrefix(decoratorNameKey);
  for (const [key, value] of originMap) {
    if (key.indexOf(prefix) !== -1) {
      res.push(value);
    }
  }
  return res;
}

/**
 * save property data
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 * @since 2.3.0
 * @deprecated Use MetadataManager.defineMetadata instead
 */
export function savePropertyMetadata(
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) {
  return MetadataManager.defineMetadata(
    decoratorNameKey as string | symbol,
    data,
    target,
    propertyName
  );
}

/**
 * attach property data
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 * @since 2.3.0
 * @deprecated
 */
export function attachPropertyMetadata(
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) {
  return MetadataManager.attachMetadata(
    decoratorNameKey as string | symbol,
    data,
    target,
    propertyName
  );
}

/**
 * get property data
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 * @since 2.3.0
 * @deprecated Use MetadataManager.getOwnMetadata instead
 */
export function getPropertyMetadata<T = any>(
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName
): T {
  return MetadataManager.getOwnMetadata<T>(
    decoratorNameKey as string | symbol,
    target,
    propertyName
  );
}

/**
 * save preload module by target
 * @param target
 * @since 2.0.0
 * @deprecated Use DecoratorManager.savePreloadModule instead
 */
export function savePreloadModule(target) {
  return DecoratorManager.savePreloadModule(target);
}

/**
 * list preload module
 * @since 2.0.0
 * @deprecated Use DecoratorManager.listPreloadModule instead
 */
export function listPreloadModule(): any[] {
  return DecoratorManager.listPreloadModule();
}

/**
 * save module to inner map
 * @param decoratorNameKey
 * @param target
 * @since 2.0.0
 * @deprecated Use DecoratorManager.saveModule instead
 */
export function saveModule(decoratorNameKey: ObjectIdentifier, target) {
  return DecoratorManager.saveModule(decoratorNameKey, target);
}

/**
 * @since 3.0.0
 * @deprecated Use DecoratorManager.bindContainer instead
 */
export function bindContainer(container) {
  return DecoratorManager.bindContainer(container);
}
/**
 * Clear the container which is bound by bindContainer
 * @since 3.0.0
 * @deprecated Use DecoratorManager.clearBindContainer instead
 */
export function clearBindContainer() {
  return DecoratorManager.clearBindContainer();
}

/**
 * list module from decorator key
 * @param decoratorNameKey
 * @param filter
 * @since 2.0.0
 * @deprecated Use DecoratorManager.listModule instead
 */
export function listModule(
  decoratorNameKey: ObjectIdentifier,
  filter?: (module) => boolean
): any[] {
  return DecoratorManager.listModule(decoratorNameKey, filter);
}

/**
 * reset module
 * @param decoratorNameKey
 * @since 2.0.0
 * @deprecated Use DecoratorManager.resetModule instead
 */
export function resetModule(decoratorNameKey: ObjectIdentifier): void {
  return DecoratorManager.resetModule(decoratorNameKey);
}

/**
 * clear all module
 * @since 3.0.0
 * @deprecated Use DecoratorManager.clearAllModule instead
 */
export function clearAllModule() {
  return DecoratorManager.clearAllModule();
}

/**
 * class provider id
 * @since 2.3.0
 * @deprecated Use DecoratorManager.saveProviderId instead
 */
export function saveProviderId(identifier: ObjectIdentifier, target: any) {
  return DecoratorManager.saveProviderId(identifier, target);
}

/**
 * get provider id from module
 * @since 3.0.0
 * @deprecated Use DecoratorManager.getProviderId instead
 */
export function getProviderId(module): string {
  return DecoratorManager.getProviderId(module);
}

/**
 * @since 3.0.0
 * @deprecated Use DecoratorManager.getProviderName instead
 */
export function getProviderName(module): string {
  return DecoratorManager.getProviderName(module);
}

/**
 * get provider uuid from module
 * @since 3.0.0
 * @deprecated Use DecoratorManager.getProviderUUId instead
 */
export function getProviderUUId(module): string {
  return DecoratorManager.getProviderUUId(module);
}

/**
 * use @Provide decorator or not
 * @since 3.0.0
 * @deprecated Use DecoratorManager.isProvide instead
 */
export function isProvide(target: any): boolean {
  return DecoratorManager.isProvide(target);
}

/**
 * Create a custom property inject
 * @param decoratorKey
 * @param metadata
 * @param impl default true, configuration need decoratorService.registerMethodHandler
 * @since 3.0.0
 * @deprecated Use DecoratorManager.createCustomPropertyDecorator instead
 */
export function createCustomPropertyDecorator(
  decoratorKey: string,
  metadata: any,
  impl = true
): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(
    decoratorKey,
    metadata,
    impl
  );
}
/**
 * Create a custom method decorator
 * @param decoratorKey
 * @param metadata
 * @param implOrOptions
 * @since 3.0.0
 * @deprecated Use DecoratorManager.createCustomMethodDecorator instead
 */
export function createCustomMethodDecorator(
  decoratorKey: string,
  metadata: any,
  implOrOptions: boolean | MethodDecoratorOptions = { impl: true }
): MethodDecorator {
  return DecoratorManager.createCustomMethodDecorator(
    decoratorKey,
    metadata,
    implOrOptions
  );
}
/**
 * Create a custom param decorator
 * @param decoratorKey
 * @param metadata
 * @param implOrOptions
 * @since 3.0.0
 * @deprecated Use DecoratorManager.createCustomParamDecorator instead
 */
export function createCustomParamDecorator(
  decoratorKey: string,
  metadata: any,
  implOrOptions: boolean | ParamDecoratorOptions = { impl: true }
): ParameterDecorator {
  return DecoratorManager.createCustomParamDecorator(
    decoratorKey,
    metadata,
    implOrOptions
  );
}

/**
 * get property(method) type from metadata
 * @param target
 * @param methodName
 * @since 3.0.0
 * @deprecated Use MetadataManager.getPropertyType instead
 */
export function getPropertyType(target, methodName: string | symbol) {
  return MetadataManager.transformTypeFromTSDesign(
    MetadataManager.getPropertyType(target, methodName)
  );
}

/**
 * get parameters type by reflect-metadata
 * @since 3.0.0
 * @deprecated Use MetadataManager.getMethodParamTypes instead
 */
export function getMethodParamTypes(target, methodName: string | symbol) {
  return MetadataManager.getMethodParamTypes(target, methodName);
}

/**
 * save property inject args
 * @param opts 参数
 * @since 2.3.0
 * @deprecated Use MetadataManager.attachMetadata instead
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
  saveInjectMetadata(opts.identifier, opts.target, opts.targetKey);
}

/**
 * get property inject args
 * @param target
 * @param useCache
 * @since 2.3.0
 * @deprecated Use MetadataManager.getMetadata instead
 */
export function getPropertyInject(
  target: any,
  useCache?: boolean
): {
  [methodName: string]: TagPropsMetadata;
} {
  const ret = _getClassExtendedMetadata(
    PROPERTY_INJECT_KEY,
    target,
    undefined,
    useCache
  );

  for (const key in ret) {
    const element = ret[key];
    if (Array.isArray(element) && element.length) {
      ret[key] = element[element.length - 1];
    }
  }
  return ret;
}

/**
 * save class object definition
 * @param target class
 * @param props property data
 * @since 2.3.0
 * @deprecated Use MetadataManager.attachMetadata instead
 */
export function saveObjectDefinition(target: any, props = {}) {
  MetadataManager.attachMetadata(
    OBJ_DEF_CLS,
    props,
    target,
    '__fake_object_def_method'
  );
  return target;
}

/**
 * get class object definition from metadata
 * @param target
 * @since 2.3.0
 * @deprecated Use MetadataManager.getPropertiesWithMetadata instead
 */
export function getObjectDefinition(target: any): ObjectDefinitionOptions {
  /**
   * Array(1) [{…}]
   */
  const ret = _getClassExtendedMetadata(OBJ_DEF_CLS, target);
  const scope = MetadataManager.getOwnMetadata(SCOPE_KEY, target);
  if (Array.isArray(ret)) {
    const res = {};
    for (const v of ret) {
      Object.assign(res, v);
    }
    return res;
  } else {
    // {
    //   "abcde": [
    //     {
    //       "initMethod": "abcde"
    //     }
    //   ],
    //   "destroy": [
    //     {
    //       "destroyMethod": "destroy"
    //     }
    //   ]
    // }
    // merge object and get
    // {
    //   "destroyMethod": "destroy",
    //   "initMethod": "abcde",
    // }
    const res = {};
    for (const key in ret) {
      const element = ret[key];
      if (Array.isArray(element)) {
        for (const v of element) {
          Object.assign(res, v);
        }
      } else {
        Object.assign(res, element);
      }
    }
    // merge scope
    return Object.assign(res, scope);
  }
}
