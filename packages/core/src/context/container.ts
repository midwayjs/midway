import {
  DecoratorManager,
  OBJECT_DEFINITION_KEY,
  PROPERTY_INJECT_KEY,
  CUSTOM_PROPERTY_INJECT_KEY,
  SCOPE_KEY,
  CONSTRUCTOR_INJECT_KEY,
} from '../decorator';
import * as util from 'util';
import { ObjectDefinitionRegistry } from './definitionRegistry';
import {
  ClassType,
  ConstructorInjectMetadata,
  IIdentifierRelationShip,
  IMidwayContainer,
  IMidwayGlobalContainer,
  IObjectDefinition,
  IObjectDefinitionRegistry,
  ObjectIdentifier,
  ObjectLifeCycleEvent,
  PropertyInjectMetadata,
  ScopeEnum,
} from '../interface';
import {
  CONTAINER_OBJ_SCOPE,
  FUNCTION_INJECT_KEY,
  REQUEST_CTX_KEY,
  SINGLETON_CONTAINER_CTX,
} from '../constants';
import { ObjectDefinition } from '../definitions/objectDefinition';
import { FunctionDefinition } from '../definitions/functionDefinition';
import { ManagedResolverFactory } from './managedResolverFactory';
import { EventEmitter } from 'events';
import { Types } from '../util/types';
import { Utils } from '../util';
import { MetadataManager } from '../decorator/metadataManager';

const debug = util.debuglog('midway:debug');
const debugBind = util.debuglog('midway:bind');
const debugSpaceLength = 9;

export class MidwayContainer implements IMidwayGlobalContainer {
  private _resolverFactory: ManagedResolverFactory = null;
  private _registry: IObjectDefinitionRegistry = null;
  private _identifierMapping = null;
  private _objectCreateEventTarget: EventEmitter;
  // 仅仅用于兼容 requestContainer 的 ctx
  protected ctx = SINGLETON_CONTAINER_CTX;
  private attrMap: Map<string, any> = new Map();
  private namespaceSet: Set<string> = new Set<string>();
  private _id = Utils.generateRandomId();

  get id() {
    return this._id;
  }

  constructor() {
    // 防止直接从applicationContext.getAsync or get对象实例时依赖当前上下文信息出错
    // ctx is in requestContainer
    this.registerObject(REQUEST_CTX_KEY, this.ctx);
  }

  get objectCreateEventTarget() {
    if (!this._objectCreateEventTarget) {
      this._objectCreateEventTarget = new EventEmitter();
    }
    return this._objectCreateEventTarget;
  }

  get registry(): IObjectDefinitionRegistry {
    if (!this._registry) {
      this._registry = new ObjectDefinitionRegistry();
    }
    return this._registry;
  }

  set registry(registry) {
    this._registry = registry;
  }

  get identifierMapping(): IIdentifierRelationShip {
    if (!this._identifierMapping) {
      this._identifierMapping = this.registry.getIdentifierRelation();
    }
    return this._identifierMapping;
  }

  public addNamespace(ns: string) {
    this.namespaceSet.add(ns);
  }

  bindClass(exports, options?: Partial<IObjectDefinition>) {
    if (Types.isClass(exports) || Types.isFunction(exports)) {
      this.bindModule(exports, options);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (Types.isClass(module) || Types.isFunction(module)) {
          this.bindModule(module, options);
        }
      }
    }
  }

  bind<T>(target: T, options?: Partial<IObjectDefinition>): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: Partial<IObjectDefinition>
  ): void;
  bind<T>(identifier: any, target: any, options?: any): void {
    if (Types.isClass(identifier) || Types.isFunction(identifier)) {
      return this.bindModule(identifier, target);
    }

    if (this.registry.hasDefinition(identifier)) {
      // 如果 definition 存在就不再重复 bind
      return;
    }

    if (options?.bindHook) {
      options.bindHook(target, options);
    }

    let definition;
    if (Types.isClass(target)) {
      definition = new ObjectDefinition();
      definition.name = DecoratorManager.getProviderName(target);
    } else {
      definition = new FunctionDefinition();
      if (!Types.isAsyncFunction(target)) {
        definition.asynchronous = false;
      }
      definition.name = definition.id;
    }

    definition.path = target;
    definition.id = identifier;
    definition.srcPath = options?.srcPath || null;
    definition.namespace = options?.namespace || '';
    definition.scope = options?.scope || ScopeEnum.Request;
    definition.createFrom = options?.createFrom;

    if (definition.srcPath) {
      debug(
        `[core]: bind id "${definition.name} (${definition.srcPath}) ${identifier}"`
      );
    } else {
      debug(`[core]: bind id "${definition.name}" ${identifier}`);
    }

    // inject constructor
    const constructorProps = MetadataManager.getPropertiesWithMetadata<{
      default: ConstructorInjectMetadata[];
    }>(CONSTRUCTOR_INJECT_KEY, target);

    if (constructorProps['default']) {
      const argsLen = constructorProps['default'].length;
      const constructorArgs = new Array(argsLen);
      for (const constructorMeta of constructorProps['default']) {
        debugBind(
          `${' '.repeat(
            debugSpaceLength
          )}inject constructor => [${JSON.stringify(constructorMeta)}]`
        );

        constructorArgs[constructorMeta.parameterIndex] = constructorMeta;
      }
      definition.constructorArgs = constructorArgs;
    }

    // inject properties
    const props = MetadataManager.getPropertiesWithMetadata(
      PROPERTY_INJECT_KEY,
      target
    );

    for (const p in props) {
      const propertyMeta: PropertyInjectMetadata = props[p];
      debugBind(
        `${' '.repeat(debugSpaceLength)}inject properties => [${JSON.stringify(
          propertyMeta
        )}]`
      );

      definition.properties.set(propertyMeta.targetKey, propertyMeta);
    }

    // inject custom properties
    const customProps = MetadataManager.getPropertiesWithMetadata(
      CUSTOM_PROPERTY_INJECT_KEY,
      target
    );

    for (const p in customProps) {
      for (const propertyMeta of customProps[p]) {
        definition.handlerProps.push(propertyMeta);
      }
    }

    // @async, @init, @destroy
    const objDefMetadata = MetadataManager.getPropertiesWithMetadata(
      OBJECT_DEFINITION_KEY,
      target
    );

    const objDefOptions = {} as Partial<IObjectDefinition>;
    for (const p in objDefMetadata) {
      Object.assign(objDefOptions, objDefMetadata[p][0]);
    }

    if (objDefOptions.initMethod) {
      debugBind(
        `${' '.repeat(debugSpaceLength)}register initMethod = ${
          objDefOptions.initMethod
        }`
      );
      definition.initMethod = objDefOptions.initMethod;
    }

    if (objDefOptions.destroyMethod) {
      debugBind(
        `${' '.repeat(debugSpaceLength)}register destroyMethod = ${
          objDefOptions.destroyMethod
        }`
      );
      definition.destroyMethod = objDefOptions.destroyMethod;
    }

    const scopeMetadata = MetadataManager.getOwnMetadata(SCOPE_KEY, target);

    if (scopeMetadata) {
      const { scope, allowDowngrade } = scopeMetadata;
      debugBind(`${' '.repeat(debugSpaceLength)}register scope = ${scope}`);
      definition.scope = scope;

      debugBind(
        `${' '.repeat(
          debugSpaceLength
        )}register allowDowngrade = ${allowDowngrade}`
      );
      definition.allowDowngrade = allowDowngrade;
    }

    this.objectCreateEventTarget.emit(
      ObjectLifeCycleEvent.BEFORE_BIND,
      target,
      {
        context: this,
        definition,
        replaceCallback: newDefinition => {
          definition = newDefinition;
        },
      }
    );

    if (definition) {
      this.registry.registerDefinition(definition.id, definition);
    }
  }

  protected bindModule(module: any, options: Partial<IObjectDefinition>) {
    if (Types.isClass(module)) {
      const providerId = DecoratorManager.getProviderUUId(module);
      if (providerId) {
        this.identifierMapping.saveClassRelation(module, options?.namespace);
        this.bind(providerId, module, options);
      } else {
        // no provide or js class must be skip
      }
    } else {
      const info: {
        id: ObjectIdentifier;
        provider: (context?: IMidwayContainer) => any;
        scope?: ScopeEnum;
      } = module[FUNCTION_INJECT_KEY];
      if (info && info.id) {
        if (!info.scope) {
          info.scope = ScopeEnum.Request;
        }
        const uuid = Utils.generateRandomId();
        this.identifierMapping.saveFunctionRelation(info.id, uuid);
        this.bind(uuid, module, {
          scope: info.scope,
          namespace: options.namespace,
          srcPath: options.srcPath,
          createFrom: options.createFrom,
        });
      }
    }
  }

  public setAttr(key: string, value) {
    this.attrMap.set(key, value);
  }

  public getAttr<T>(key: string): T {
    return this.attrMap.get(key);
  }

  public getIdentifier(identifier: ClassType | string): string {
    if (typeof identifier !== 'string') {
      identifier = DecoratorManager.getProviderUUId(identifier);
    }
    return identifier;
  }

  public getManagedResolverFactory() {
    if (!this._resolverFactory) {
      this._resolverFactory = new ManagedResolverFactory(this);
    }
    return this._resolverFactory;
  }

  async stop(): Promise<void> {
    await this.getManagedResolverFactory().destroyCache();
    this.registry.clearAll();
    this.attrMap.clear();
  }

  // ready() {
  //   return this.loadDefinitions();
  // }

  get<T>(identifier: ClassType<T> | string, args?: any[]): T {
    return this.getManagedResolverFactory().create(identifier, args, this);
  }

  async getAsync<T>(
    identifier: ClassType<T> | string,
    args?: any[]
  ): Promise<T> {
    return this.getManagedResolverFactory().createAsync(identifier, args, this);
  }

  /**
   * proxy registry.registerObject
   * @param {ObjectIdentifier} identifier
   * @param target
   */
  registerObject(identifier: ObjectIdentifier, target: any) {
    this.registry.registerObject(identifier, target);
  }

  onBeforeBind(
    fn: (
      Clzz: any,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
        replaceCallback: (newDefinition: IObjectDefinition) => void;
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_BIND, fn);
  }

  onBeforeObjectCreated(
    fn: (
      Clzz: any,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
        constructorArgs: any[];
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_CREATED, fn);
  }

  onObjectCreated<T>(
    fn: (
      ins: T,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
        replaceCallback: (ins: T) => void;
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.AFTER_CREATED, fn);
  }

  onObjectInit<T>(
    fn: (
      ins: T,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.AFTER_INIT, fn);
  }

  onBeforeObjectDestroy<T>(
    fn: (
      ins: T,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_DESTROY, fn);
  }

  hasNamespace(ns: string) {
    return this.namespaceSet.has(ns);
  }

  getNamespaceList() {
    return Array.from(this.namespaceSet);
  }

  hasDefinition(identifier: ObjectIdentifier) {
    return this.registry.hasDefinition(identifier);
  }

  getDefinition(identifier: ObjectIdentifier) {
    return this.registry.getDefinition(identifier);
  }

  hasObject(identifier: ObjectIdentifier) {
    return this.registry.hasObject(identifier);
  }

  getObject<T>(identifier: ObjectIdentifier): T {
    return this.registry.getObject(identifier);
  }

  getInstanceScope(instance: any): ScopeEnum | undefined {
    if (instance[CONTAINER_OBJ_SCOPE]) {
      return instance[CONTAINER_OBJ_SCOPE];
    }
    return undefined;
  }
}
