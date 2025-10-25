import 'reflect-metadata';
import { isClass, isNullOrUndefined } from '../util/types';
import { ClassType, TSDesignType } from '../interface';

type CleanHook = (keyToClear: string) => boolean;

const separator = '\u200A'; // Hair Space

enum ObjectType {
  Class = 'class',
  Instance = 'instance',
  Object = 'object',
}

/**
 * A class that manages metadata for classes and properties
 * This class is a simplified version of the Reflect Metadata API
 * Provides a way to retrieve, define, delete and copy metadata
 *
 * @since 4.0.0
 */
export class MetadataManager {
  private static _metadataStore = new WeakMap<
    ClassType | object,
    Record<string | symbol, any>
  >();
  protected static readonly metadataClassSymbol = Symbol.for(
    'midway.metadata.class'
  );
  protected static readonly metadataPropertySymbol = Symbol.for(
    'midway.metadata.property'
  );
  protected static readonly cacheSymbol = Symbol.for('midway.metadata.cache');
  protected static readonly cleanHooksSymbol = Symbol.for('midway.clean.hooks');
  protected static readonly isClassSymbol = Symbol.for(
    'midway.metadata.isClass'
  );
  public static ObjectType = ObjectType;
  /**
   * A symbol that represents an empty value
   */
  public static readonly emptyValueSymbol = Symbol.for('midway.metadata.empty');
  /**
   * Defines metadata for a target class or property
   * Value will replace the existing metadata
   */
  public static defineMetadata(
    metadataKey: string | symbol,
    metadataValue: any,
    target: ClassType | object,
    propertyKey?: string | symbol
  ): void {
    target = this.formatTarget(target);
    this.setMetadata(
      metadataKey,
      metadataValue,
      target as ClassType,
      propertyKey
    );
    this.invalidateCache(metadataKey, target as ClassType, propertyKey);
  }

  /**
   * Attaches metadata for a target class or property
   * Value will push to the end of the metadata array and save for own metadata
   */
  public static attachMetadata(
    metadataKey: string | symbol,
    metadataValue: any,
    target: ClassType | object,
    propertyKey?: string | symbol
  ): void {
    target = this.formatTarget(target);

    const currentMetadata = this.getOwnMetadata(
      metadataKey,
      target,
      propertyKey
    );
    if (Array.isArray(currentMetadata)) {
      currentMetadata.push(metadataValue);
      this.defineMetadata(metadataKey, currentMetadata, target, propertyKey);
    } else {
      this.defineMetadata(metadataKey, [metadataValue], target, propertyKey);
    }
  }

  /**
   * Retrieves metadata for a target class or property
   */
  public static getMetadata<T = any>(
    metadataKey: string | symbol,
    target: ClassType | object,
    propertyKey?: string | symbol
  ): T {
    target = this.formatTarget(target);
    // find cache first
    const cache = this.getCache(metadataKey, target as ClassType, propertyKey);
    if (cache === this.emptyValueSymbol) {
      return undefined;
    }
    if (cache !== undefined) {
      return cache;
    }

    // find metadata with prototype chain
    let currentTarget: ClassType | null = target as ClassType;
    while (currentTarget) {
      const metadata = this.getOwnMetadata(
        metadataKey,
        currentTarget,
        propertyKey
      );
      if (metadata !== undefined) {
        this.setCache(
          metadataKey,
          target as ClassType,
          currentTarget,
          metadata,
          propertyKey
        );
        return metadata;
      }
      currentTarget = Object.getPrototypeOf(currentTarget);
    }

    this.setCache(
      metadataKey,
      target as ClassType,
      target as ClassType,
      this.emptyValueSymbol,
      propertyKey
    );
    return undefined;
  }

  /**
   * Retrieves own metadata for a target class or property
   */
  public static getOwnMetadata<T = any>(
    metadataKey: string | symbol,
    target: ClassType | object,
    propertyKey?: string | symbol
  ): T {
    target = this.formatTarget(target);
    const _metadata = this.getOrCreateMetaObject(target);
    if (propertyKey) {
      return _metadata[this.metadataPropertySymbol][propertyKey]?.[metadataKey];
    } else {
      return _metadata[this.metadataClassSymbol][metadataKey];
    }
  }

  /**
   * Checks if metadata exists for a target class or property
   */
  public static hasMetadata(
    metadataKey: string | symbol,
    target: ClassType | object,
    propertyKey?: string | symbol
  ): boolean {
    target = this.formatTarget(target);
    return this.getMetadata(metadataKey, target, propertyKey) !== undefined;
  }

  /**
   * Checks if own metadata exists for a target class or property
   */
  public static hasOwnMetadata(
    metadataKey: string | symbol,
    target: ClassType | object,
    propertyKey?: string | symbol
  ): boolean {
    return this.getOwnMetadata(metadataKey, target, propertyKey) !== undefined;
  }

  /**
   * Deletes metadata for a target class or property
   */
  public static deleteMetadata(
    metadataKey: string | symbol,
    target: ClassType | object,
    propertyKey?: string | symbol
  ): void {
    target = this.formatTarget(target);
    const _metadata = this.getOrCreateMetaObject(target);
    if (propertyKey) {
      delete _metadata[this.metadataPropertySymbol][propertyKey]?.[metadataKey];
    } else {
      delete _metadata[this.metadataClassSymbol][metadataKey];
    }
    this.invalidateCache(metadataKey, target as ClassType, propertyKey);
  }

  /**
   * Get all metadata keys on the entire prototype chain
   * Because we need to get metadata on the entire prototype chain, we do not use cache here, so the performance is poor
   */
  public static getMetadataKeys(
    target: ClassType,
    propertyKey?: string | symbol
  ): string[] {
    target = this.formatTarget(target);
    const keys = new Set<string>();

    let currentTarget = target;
    while (currentTarget) {
      const ownKeys = this.getOwnMetadataKeys(currentTarget, propertyKey);
      ownKeys.forEach(key => keys.add(key));
      currentTarget = Object.getPrototypeOf(currentTarget);
    }

    return Array.from(keys);
  }

  /**
   * Get metadata keys on the current class or object
   */
  public static getOwnMetadataKeys(
    target: ClassType,
    propertyKey?: string | symbol
  ): string[] {
    target = this.formatTarget(target);
    const _metadata = this.getOrCreateMetaObject(target);
    if (propertyKey) {
      return Object.keys(
        _metadata[this.metadataPropertySymbol][propertyKey] || {}
      );
    } else {
      return Object.keys(_metadata[this.metadataClassSymbol]);
    }
  }

  /**
   * Copies metadata from a source class or property to a target class or property
   */
  public static copyMetadata(
    source: ClassType,
    target: ClassType,
    options?: {
      metadataFilter?: (
        metadataKey: string | symbol,
        propertyKey?: string | symbol
      ) => boolean;
      overwrite?: boolean;
    }
  ): void {
    const { metadataFilter, overwrite = true } = options || {};

    // 合并后的临时存储类级别元数据和属性级别元数据
    const tempClassMetadata: Record<string | symbol, any> = {};
    const tempPropertyMetadata: Record<string | symbol, any> = {};

    // Step 1: 收集原型链上的所有元数据（当前存在的跳过）
    let currentSource: ClassType | null = source;
    while (currentSource) {
      const sourceMetadata = this.getOrCreateMetaObject(currentSource);

      // 处理类级别元数据
      const classMetadata = sourceMetadata?.[this.metadataClassSymbol];
      for (const key in classMetadata) {
        if (tempClassMetadata[key] === undefined) {
          tempClassMetadata[key] = classMetadata[key];
        }
      }

      // 处理属性级别元数据
      const propertyMetadata = sourceMetadata?.[this.metadataPropertySymbol];
      for (const propertyKey in propertyMetadata) {
        if (!tempPropertyMetadata[propertyKey]) {
          tempPropertyMetadata[propertyKey] = {};
        }
        const propertyMetadataKeys = Object.keys(propertyMetadata[propertyKey]);
        for (const key of propertyMetadataKeys) {
          if (tempPropertyMetadata[propertyKey][key] === undefined) {
            tempPropertyMetadata[propertyKey][key] =
              propertyMetadata[propertyKey][key];
          }
        }
      }

      currentSource = Object.getPrototypeOf(currentSource);
    }

    // Step 2: 将合并后的元数据应用到目标对象，考虑 options 中的参数
    this.copyClassAndPropertyMetadata(
      target,
      metadataFilter,
      overwrite,
      tempClassMetadata,
      tempPropertyMetadata
    );
  }

  /**
   * Copies own metadata from a source class or property to a target class or property
   */
  public static copyOwnMetadata(
    source: ClassType,
    target: ClassType,
    options?: {
      metadataFilter?: (
        metadataKey: string | symbol,
        propertyKey?: string | symbol
      ) => boolean;
      overwrite?: boolean;
    }
  ): void {
    const { metadataFilter, overwrite = true } = options || {};
    const sourceMetadata = this.getOrCreateMetaObject(source);

    const classMetadata = sourceMetadata?.[this.metadataClassSymbol];
    const propertyMetadata = sourceMetadata?.[this.metadataPropertySymbol];

    this.copyClassAndPropertyMetadata(
      target,
      metadataFilter,
      overwrite,
      classMetadata,
      propertyMetadata
    );
  }

  /**
   * Retrieves all properties of the current class that have a specific metadata key and their metadata values.
   *
   * @param metadataKey - The metadata key to check for.
   * @param target - The target class to retrieve properties with metadata from.
   * @returns An object where the key is the property name and the value is the metadata value.
   */
  public static getOwnPropertiesWithMetadata<T = any>(
    metadataKey: string | symbol,
    target: ClassType
  ): {
    [key: string]: T;
  } {
    // Ensure the target is a class
    target = this.formatTarget(target);

    // Retrieve or create the metadata object for the target
    const _metadata = this.getOrCreateMetaObject(target);

    // Filter and return the properties that have the specified metadata key and their metadata values
    return Object.keys(_metadata[this.metadataPropertySymbol]).reduce(
      (result, propertyKey) => {
        const metadataValue =
          _metadata[this.metadataPropertySymbol][propertyKey]?.[metadataKey];
        if (metadataValue !== undefined) {
          result[propertyKey] = metadataValue;
        }
        return result;
      },
      {} as {
        [key: string]: T;
      }
    );
  }

  /**
   * Retrieves all properties of the class and its prototype chain that have a specific metadata key and their metadata values.
   *
   * @param metadataKey - The metadata key to check for.
   * @param target - The target class to retrieve properties with metadata from.
   * @returns An object where the key is the property name and the value is the metadata value.
   */
  public static getPropertiesWithMetadata<T = any>(
    metadataKey: string | symbol,
    target: ClassType
  ): {
    [key: string]: T;
  } {
    const propertiesWithMetadata = {} as {
      [key: string]: T;
    };

    // Traverse the prototype chain
    let currentTarget: ClassType | null = this.formatTarget(target);
    while (currentTarget) {
      const _metadata = this.getOrCreateMetaObject(currentTarget);
      Object.keys(_metadata[this.metadataPropertySymbol]).forEach(
        propertyKey => {
          const metadataValue =
            _metadata[this.metadataPropertySymbol][propertyKey]?.[metadataKey];
          if (
            metadataValue !== undefined &&
            propertiesWithMetadata[propertyKey] === undefined
          ) {
            propertiesWithMetadata[propertyKey] = metadataValue;
          }
        }
      );
      currentTarget = Object.getPrototypeOf(currentTarget);
    }

    return propertiesWithMetadata;
  }

  /**
   * Gets the type of a property from Reflect metadata
   */
  public static getMethodReturnTypes(
    target: ClassType,
    propertyKey: string | symbol
  ): any {
    if (isClass(target)) {
      target = target.prototype;
    }
    return Reflect.getMetadata('design:returntype', target, propertyKey);
  }

  /**
   * Get parameters type by reflect-metadata
   */
  public static getMethodParamTypes(
    target: ClassType,
    methodName: string | symbol,
    parameterIndex?: number
  ) {
    // 构造器参数必须传递 class，而方法参数需要传递原型对象
    if (methodName && isClass(target)) {
      target = target.prototype;
    }
    const types = Reflect.getMetadata('design:paramtypes', target, methodName);
    if (parameterIndex !== undefined && types) {
      return types[parameterIndex];
    }
    return types;
  }

  /**
   * Get property(method) type from metadata
   */
  public static getPropertyType(
    target: ClassType,
    propertyKey: string | symbol
  ) {
    if (isClass(target)) {
      target = target.prototype;
    }
    return Reflect.getMetadata('design:type', target, propertyKey);
  }

  public static transformTypeFromTSDesign(designFn: any): TSDesignType {
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

  private static copyClassAndPropertyMetadata(
    target: ClassType,
    metadataFilter: (
      metadataKey: string | symbol,
      propertyKey?: string | symbol
    ) => boolean,
    overwrite: boolean,
    classMetadata: Record<string | symbol, any>,
    propertyMetadata: Record<string | symbol, any>
  ): void {
    for (const key in classMetadata) {
      if (!metadataFilter || metadataFilter(key)) {
        const metadataValue = classMetadata[key];
        // 如果不允许覆盖且目标已有元数据，跳过
        if (!overwrite && this.hasOwnMetadata(key, target)) continue;
        this.defineMetadata(key, metadataValue, target);
      }
    }

    for (const propertyKey in propertyMetadata) {
      const propertyMetadataKeys = Object.keys(propertyMetadata[propertyKey]);
      for (const key of propertyMetadataKeys) {
        if (!metadataFilter || metadataFilter(key, propertyKey)) {
          const metadataValue = propertyMetadata[propertyKey][key];
          // 如果不允许覆盖且目标已有元数据，跳过
          if (!overwrite && this.hasOwnMetadata(key, target, propertyKey))
            continue;
          this.defineMetadata(key, metadataValue, target, propertyKey);
        }
      }
    }
  }

  /**
   * Sets metadata for a target class or property
   */
  private static setMetadata(
    metadataKey: string | symbol,
    metadataValue: any,
    target: ClassType,
    propertyKey?: string | symbol
  ): void {
    const _metadata = this.getOrCreateMetaObject(target);
    const metadataStorage = propertyKey
      ? (_metadata[this.metadataPropertySymbol][propertyKey] ||= {})
      : _metadata[this.metadataClassSymbol];
    metadataStorage[metadataKey] = metadataValue;
  }

  /**
   * Gets or creates the metadata object for a target class or property
   */
  private static getOrCreateMetaObject(target: ClassType | object): any {
    /**
     * metadata construct
     * {
     *  [metadataClassSymbol]: {
     *    [metadataKey]: metadataValue
     *  },
     *  [metadataPropertySymbol]: {
     *    [propertyKey]: {
     *      [metadataKey]: metadataValue
     *    }
     *  }
     */
    if (!this._metadataStore.has(target)) {
      this._metadataStore.set(target, {
        [this.metadataClassSymbol]: Object.create(null),
        [this.metadataPropertySymbol]: Object.create(null),
      });
    }
    return this._metadataStore.get(target);
  }

  private static invalidateCache(
    metadataKey: string | symbol,
    target: ClassType,
    propertyKey?: string | symbol
  ): void {
    // remove current cache
    const unionKey = this.getUnionKey(metadataKey, propertyKey);

    // Remove the specific cache
    // eslint-disable-next-line no-prototype-builtins
    if (this.hasOwnProperty(target, this.cacheSymbol)) {
      delete this.getOwnProperty(target, this.cacheSymbol)?.[unionKey];
    }

    // Execute hooks, passing the unionKey to clear
    const cleanHooks = this.getOwnProperty<Array<CleanHook>>(
      target,
      this.cleanHooksSymbol
    );
    if (cleanHooks) {
      this.setOwnProperty(
        target,
        this.cleanHooksSymbol,
        cleanHooks.filter(hook => !hook(unionKey))
      );
    }
  }

  private static setCache(
    metadataKey: string | symbol,
    target: ClassType,
    protoTarget: ClassType,
    value: any,
    propertyKey?: string | symbol
  ): void {
    this.validCacheConstruct(target);
    const unionKey = this.getUnionKey(metadataKey, propertyKey);
    if (target !== protoTarget) {
      this.validCacheConstruct(protoTarget);
      // Register a clean hook to the prototype target and clean the cache when the prototype target value is changed
      this.getOwnProperty<Array<CleanHook>>(
        protoTarget,
        this.cleanHooksSymbol
      ).push((keyToClear: string) => {
        // Only delete cache if the key matches
        if (keyToClear === unionKey) {
          delete this.getOwnProperty(target, this.cacheSymbol)?.[unionKey];
          // Indicates that this hook can be removed
          return true;
        }
        return false;
      });
    }
    this.getOwnProperty(target, this.cacheSymbol)[unionKey] = value;
  }

  private static validCacheConstruct(target) {
    const metadata = this.getOrCreateMetaObject(target);
    // eslint-disable-next-line no-prototype-builtins
    if (!metadata[this.cacheSymbol]) {
      metadata[this.cacheSymbol] = Object.create(null);
    }

    if (!metadata[this.cleanHooksSymbol]) {
      metadata[this.cleanHooksSymbol] = [];
    }
  }

  protected static getCache(
    metadataKey: string | symbol,
    target: ClassType,
    propertyKey?: string | symbol
  ): any {
    return this.getOwnProperty(target, this.cacheSymbol)?.[
      this.getUnionKey(metadataKey, propertyKey)
    ];
  }

  private static getUnionKey(
    metadataKey: string | symbol,
    propertyKey?: string | symbol
  ) {
    return propertyKey
      ? `${propertyKey.toString()}${separator}${metadataKey.toString()}`
      : metadataKey.toString();
  }

  private static formatTarget(target: any) {
    let ret: ObjectType = this.getOwnProperty(target, this.isClassSymbol);
    if (!ret) {
      const isClassRet = isClass(target);
      if (isClassRet) {
        ret = ObjectType.Class;
      } else if (isClass(target.constructor)) {
        ret = ObjectType.Instance;
      } else {
        ret = ObjectType.Object;
      }

      this.setOwnProperty(target, this.isClassSymbol, ret);
    }

    return ret === ObjectType.Instance ? target.constructor : target;
  }

  public static ensureTargetType(target: any, type: ObjectType): void {
    // eslint-disable-next-line no-prototype-builtins
    const ret: ObjectType = this.getOwnProperty(target, this.isClassSymbol);
    if (!ret) {
      this.setOwnProperty(target, this.isClassSymbol, type);
    }
  }

  private static getOwnProperty<T>(
    target,
    propertyKey: string | symbol
  ): T | undefined {
    const _metadata = this.getOrCreateMetaObject(target);
    return _metadata[propertyKey] ?? undefined;
  }

  private static hasOwnProperty(target, propertyKey: string | symbol): boolean {
    if (!this._metadataStore.has(target)) {
      return false;
    }
    const _metadata = this._metadataStore.get(target);
    return _metadata[propertyKey] !== undefined;
  }

  private static setOwnProperty(
    target,
    propertyKey: string | symbol,
    value: any
  ): void {
    const _metadata = this.getOrCreateMetaObject(target);
    _metadata[propertyKey] = value;
  }

  public static clear(): void {
    this._metadataStore = new WeakMap<
      ClassType | object,
      Record<string | symbol, any>
    >();
  }
}
