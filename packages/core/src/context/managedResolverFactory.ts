/**
 * 管理对象解析构建
 */
import {
  CONTAINER_OBJ_SCOPE,
  REQUEST_CTX_KEY,
  REQUEST_CTX_UNIQUE_KEY,
  REQUEST_OBJ_CTX_KEY,
  SINGLETON_CONTAINER_CTX,
} from '../constants';
import {
  ClassType,
  IMidwayContainer,
  IMidwayGlobalContainer,
  IObjectDefinition,
  ObjectIdentifier,
  ObjectLifeCycleEvent,
  PropertyInjectMetadata,
  ScopeEnum,
} from '../interface';
import * as util from 'util';
import * as EventEmitter from 'events';
import {
  MidwayCommonError,
  MidwayDefinitionNotFoundError,
  MidwaySingletonInjectRequestError,
} from '../error';
import { FunctionDefinition } from '../definitions/functionDefinition';

const debug = util.debuglog('midway:debug');

function createProxy<T>(factory: () => T): T {
  let instance: T;
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (!instance) {
          instance = factory();
        }
        return instance[prop];
      },
    }
  ) as T;
}

function formatObjectIdentifier(
  identifier: ObjectIdentifier | (() => ObjectIdentifier | ClassType)
): ObjectIdentifier | ClassType {
  if (typeof identifier === 'function') {
    return identifier();
  }
  return identifier;
}

/**
 * 解析工厂
 */
export class ManagedResolverFactory {
  private creating = new Map<string, boolean>();
  context: IMidwayGlobalContainer;

  constructor(context: IMidwayGlobalContainer) {
    this.context = context;
  }

  /**
   * 同步创建对象
   * @param identifier
   * @param args
   * @param currentContext
   */
  create<T = any>(
    identifier: ClassType<T> | string,
    args = [],
    currentContext: IMidwayContainer
  ): T {
    const name = typeof identifier === 'string' ? identifier : identifier.name;
    identifier = currentContext.getIdentifier(identifier);
    debug('[core]: create "%s(%s)"', identifier, name);

    if (currentContext.hasObject(identifier)) {
      return currentContext.getObject(identifier);
    }

    const definition = this.getObjectDefinition(identifier);

    if (
      !definition &&
      currentContext !== this.context &&
      this.context.hasObject(identifier)
    ) {
      return this.context.getObject(identifier);
    }

    if (!definition) {
      throw new MidwayDefinitionNotFoundError(identifier, name);
    }

    const pendingInitQueue: Array<
      [any, IObjectDefinition, () => any, (newValue: any) => void]
    > = [];
    const pendingObjectCache = new Map<string, any>();
    const instance = this.createInstance(
      identifier,
      name,
      args,
      definition,
      false,
      false,
      currentContext,
      pendingObjectCache,
      pendingInitQueue
    );
    pendingObjectCache.clear();
    const newInstance = this.initializeInstance(
      instance,
      definition,
      pendingInitQueue
    );
    return newInstance ?? instance;
  }

  async createAsync<T = any>(
    identifier: ClassType<T> | string,
    args = [],
    currentContext: IMidwayContainer
  ): Promise<T> {
    const name = typeof identifier === 'string' ? identifier : identifier.name;
    identifier = currentContext.getIdentifier(identifier);
    debug('[core]: createAsync "%s(%s)"', identifier, name);

    if (currentContext.hasObject(identifier)) {
      return currentContext.getObject(identifier);
    }

    const definition = this.getObjectDefinition(identifier);

    if (
      !definition &&
      currentContext !== this.context &&
      this.context.hasObject(identifier)
    ) {
      return this.context.getObject(identifier);
    }

    if (!definition) {
      throw new MidwayDefinitionNotFoundError(identifier, name);
    }

    const pendingInitQueue: Array<
      [any, IObjectDefinition, () => Promise<any>, (newValue: any) => void]
    > = [];
    const pendingObjectCache = new Map<string, any>();
    const instance = this.createInstance(
      identifier,
      definition?.name ?? name,
      args,
      definition,
      true,
      false,
      currentContext,
      pendingObjectCache,
      pendingInitQueue
    );
    pendingObjectCache.clear();
    const newInstance = await this.initializeInstanceAsync(
      instance,
      definition,
      pendingInitQueue
    );
    return newInstance ?? instance;
  }

  async destroyCache(): Promise<void> {
    for (const key of this.context.registry.getSingletonDefinitionIds()) {
      const definition = this.getObjectDefinition(key);
      if (definition.creator) {
        const inst = this.context.getObject(key);
        this.getObjectEventTarget().emit(
          ObjectLifeCycleEvent.BEFORE_DESTROY,
          inst,
          {
            context: this.context,
            definition,
          }
        );
        await definition.creator.doDestroyAsync(inst);
      }
      // clean singleton object cache
      this.context.removeObject(key);
    }

    this.creating.clear();
  }

  private getObjectEventTarget(): EventEmitter {
    return this.context.objectCreateEventTarget;
  }

  private checkSingletonInvokeRequest(definition, key, currentContext) {
    if (definition.isSingletonScope()) {
      const managedRef: PropertyInjectMetadata = definition.properties.get(key);
      if (currentContext.hasDefinition(managedRef?.id)) {
        const propertyDefinition = currentContext.getDefinition(managedRef.id);
        if (
          propertyDefinition.isRequestScope() &&
          !propertyDefinition.allowDowngrade
        ) {
          throw new MidwaySingletonInjectRequestError(
            definition.path.name,
            propertyDefinition.path.name
          );
        }
      }
    }
    return true;
  }

  private setInstanceScope(inst, scope: ScopeEnum) {
    if (typeof inst === 'object') {
      if (
        scope === ScopeEnum.Request &&
        inst[REQUEST_OBJ_CTX_KEY] === SINGLETON_CONTAINER_CTX
      ) {
        scope = ScopeEnum.Singleton;
      }
      Object.defineProperty(inst, CONTAINER_OBJ_SCOPE, {
        value: scope,
        writable: false,
        enumerable: false,
        configurable: false,
      });
    }
  }

  private createInstance(
    identifier: ClassType | string,
    name: string,
    args = [],
    definition: IObjectDefinition,
    isAsync: boolean,
    isLazyInject: boolean,
    currentContext: IMidwayContainer,
    pendingObjectCache: Map<string, any>,
    pendingInitQueue: Array<
      [any, IObjectDefinition, () => any, (newValue: any) => void]
    >,
    creationPath: Set<string> = new Set(),
    replaceCallback?: (newValue: any) => void
  ): any {
    identifier = currentContext.getIdentifier(identifier);
    if (currentContext.hasObject(identifier)) {
      return currentContext.getObject(identifier);
    }

    definition = definition ?? currentContext.getDefinition(identifier);

    if (
      !definition &&
      currentContext !== this.context &&
      this.context.hasObject(identifier)
    ) {
      return this.context.getObject(identifier);
    }

    if (!definition) {
      throw new MidwayDefinitionNotFoundError(
        identifier as string,
        name,
        this.translateIdentifiers(Array.from(creationPath))
      );
    }

    if (definition.isSingletonScope()) {
      currentContext = this.context;
      if (this.context.hasObject(definition.id)) {
        debug(
          `[core]: "${definition.id}(${definition.name})" get from singleton cache.`
        );
        return this.context.getObject(definition.id);
      }
      // if (this.singletonCache.has(definition.id)) {
      //   debug(
      //     `[core]: "${definition.id}(${definition.name})" get from singleton cache.`
      //   );
      //   return this.singletonCache.get(definition.id);
      // }
    }

    // 使用 creationPath 检查循环依赖
    if (creationPath.has(definition.id)) {
      if (isLazyInject) {
        return createProxy(() => {
          return currentContext.get(definition.id);
        });
      } else {
        const cycle = Array.from(creationPath).concat(definition.id);
        throw new MidwayCommonError(
          `Circular dependency detected: ${this.translateIdentifiers(
            cycle
          ).join(' -> ')}`
        );
      }
    }

    if (pendingObjectCache.has(definition.id)) {
      return pendingObjectCache.get(definition.id);
    }

    creationPath.add(definition.id);

    // Pre-initialize dependencies
    if (definition.hasDependsOn()) {
      for (const dep of definition.dependsOn) {
        debug('[core]: id = %s init depend %s.', definition.id, dep);
        this.createInstance(
          dep as string,
          dep as string,
          [],
          undefined,
          isAsync,
          false,
          currentContext,
          pendingObjectCache,
          pendingInitQueue,
          new Set(creationPath)
        );
      }
    }

    // Get class or function from definition
    const Clzz = definition.creator.load();

    // Get constructor args
    let constructorArgs = new Array(definition.constructorArgs.length);
    if (args && Array.isArray(args) && args.length > 0) {
      constructorArgs = args;
    } else {
      // init constructor args
      for (let i = 0; i < definition.constructorArgs.length; i++) {
        const arg = definition.constructorArgs[i];
        if (arg === undefined) continue;
        arg.id = formatObjectIdentifier(arg.id) as string;

        debug(
          '[core]: constructor arg "%s(%s)", pos=%s, in "%s".',
          arg.id,
          arg.name,
          arg.parameterIndex,
          name
        );
        constructorArgs[i] = this.createInstance(
          arg.id,
          arg.name,
          [],
          undefined,
          isAsync,
          arg.isLazyInject,
          currentContext,
          pendingObjectCache,
          pendingInitQueue,
          new Set(creationPath)
        );
      }
    }

    // Emit before created event
    this.getObjectEventTarget().emit(
      ObjectLifeCycleEvent.BEFORE_CREATED,
      Clzz,
      {
        constructorArgs,
        context: currentContext,
      }
    );

    // Create instance
    let inst = definition.creator.doConstruct(Clzz, constructorArgs);

    if (!inst) {
      throw new MidwayCommonError(
        `${definition.id} construct return undefined`
      );
    }

    // Binding ctx object
    if (
      definition.isRequestScope() &&
      definition.constructor.name === 'ObjectDefinition'
    ) {
      debug('[core]: "%s(%s)" inject ctx', definition.id, definition.name);
      // set related ctx
      Object.defineProperty(inst, REQUEST_OBJ_CTX_KEY, {
        value: currentContext.get(REQUEST_CTX_KEY),
        writable: false,
        enumerable: false,
      });
    }

    pendingObjectCache.set(definition.id, inst);

    // Set properties
    if (definition.properties) {
      const keys = Array.from(definition.properties.keys());
      for (const key of keys) {
        this.checkSingletonInvokeRequest(definition, key, currentContext);
        const resolver: PropertyInjectMetadata = definition.properties.get(key);
        resolver.id = formatObjectIdentifier(resolver.id) as string;
        // if (
        //   resolver.injectMode === InjectModeEnum.Class &&
        //   !(this.getRootContext(currentContext)).hasDefinition(
        //     resolver.id
        //   )
        // ) {
        //   if (resolver.name === 'loggerService') {
        //     throw new MidwayInconsistentVersionError();
        //   } else {
        //     throw new MidwayMissingImportComponentError(resolver.name);
        //   }
        // }
        debug(
          '[core]: property "%s(%s)", in "%s".',
          resolver.id || resolver.name,
          resolver.name,
          name
        );
        inst[key] = this.createInstance(
          resolver.id || resolver.name,
          resolver.name,
          resolver.args,
          undefined,
          isAsync,
          resolver.isLazyInject,
          currentContext,
          pendingObjectCache,
          pendingInitQueue,
          new Set(creationPath),
          newValue => {
            inst[key] = newValue;
          }
        );
      }
    }

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_CREATED, inst, {
      context: currentContext,
      definition,
      replaceCallback: ins => {
        inst = ins;
      },
    });

    debug(
      '[core]: put "%s(%s)" to pending init queue.',
      definition.id,
      definition.name
    );

    // Set init function to pending init queue
    if (isAsync) {
      pendingInitQueue.push([
        inst,
        definition,
        () => definition.creator.doInitAsync(inst, currentContext),
        replaceCallback,
      ]);
    } else {
      pendingInitQueue.push([
        inst,
        definition,
        () => definition.creator.doInit(inst, currentContext),
        replaceCallback,
      ]);
    }

    return inst;
  }

  private initializeInstance(
    instance: any,
    targetDefinition: IObjectDefinition,
    pendingInitQueue: Array<
      [any, IObjectDefinition, () => any, (newValue: any) => void]
    >
  ): any {
    const initializingSet = new Map<string, any>();
    const initializedInstances = new Map<string, any>();

    for (const [
      obj,
      definition,
      initFunc,
      replaceCallback,
    ] of pendingInitQueue) {
      if (!initializedInstances.has(definition.id)) {
        initializingSet.set(definition.id, obj);

        debug(
          '[core]: load "%s(%s)" from pending init queue and ready to init.',
          definition.id,
          definition.name
        );

        const res = initFunc?.();
        if (definition instanceof FunctionDefinition) {
          initializedInstances.set(definition.id, res);
          replaceCallback?.(res);
        } else {
          initializedInstances.set(definition.id, obj);
        }
        this.storeInstanceScope(obj, definition);
        this.getObjectEventTarget().emit(
          ObjectLifeCycleEvent.AFTER_INIT,
          instance,
          {
            context: this.getCurrentMatchedContext(instance),
            definition,
          }
        );
        initializingSet.delete(definition.id);
      }
    }

    return initializedInstances.get(targetDefinition.id);
  }

  private async initializeInstanceAsync(
    instance: any,
    targetDefinition: IObjectDefinition,
    pendingInitQueue: Array<
      [any, IObjectDefinition, () => Promise<void>, (newValue: any) => void]
    >
  ): Promise<any> {
    const initializingSet = new Map<string, any>();
    const initializedInstances = new Map<string, any>();

    for (const [
      obj,
      definition,
      initFunc,
      replaceCallback,
    ] of pendingInitQueue) {
      if (!initializedInstances.has(definition.id)) {
        initializingSet.set(definition.id, obj);

        debug(
          '[core]: load "%s(%s)" from pending init queue and ready to init.',
          definition.id,
          definition.name
        );

        const res = await initFunc();
        if (definition instanceof FunctionDefinition) {
          initializedInstances.set(definition.id, res);
          replaceCallback?.(res);
        } else {
          initializedInstances.set(definition.id, obj);
        }
        this.storeInstanceScope(obj, definition);
        this.getObjectEventTarget().emit(
          ObjectLifeCycleEvent.AFTER_INIT,
          instance,
          {
            context: this.getCurrentMatchedContext(instance),
            definition,
          }
        );
        initializingSet.delete(definition.id);
      }
    }

    return initializedInstances.get(targetDefinition.id);
  }

  private storeInstanceScope(
    instance: any,
    definition: IObjectDefinition
  ): void {
    if (definition.id) {
      if (definition.isSingletonScope()) {
        debug(
          `[core]: "${definition.id}(${definition.name})" set to singleton cache`
        );
        this.context.registerObject(definition.id, instance);
        // this.singletonCache.set(definition.id, instance);
        this.setInstanceScope(instance, ScopeEnum.Singleton);
      } else if (definition.isRequestScope()) {
        debug(
          `[core]: "${definition.id}(${definition.name})" set to register object`
        );
        this.getCurrentMatchedContext(instance).registerObject(
          definition.id,
          instance
        );
        this.setInstanceScope(instance, ScopeEnum.Request);
      } else {
        this.setInstanceScope(instance, ScopeEnum.Prototype);
      }
    }
  }

  private getObjectDefinition(identifier: ObjectIdentifier): IObjectDefinition {
    return this.context.getDefinition(identifier);
  }

  private getCurrentMatchedContext(instance): IMidwayContainer {
    if (instance[REQUEST_OBJ_CTX_KEY]) {
      return (
        instance[REQUEST_OBJ_CTX_KEY]?.[REQUEST_CTX_UNIQUE_KEY] ?? this.context
      );
    }

    return this.context;
  }

  private translateIdentifiers(ids: string[]) {
    return ids.map(id => {
      const definition = this.context.getDefinition(id);
      return definition.path?.name ?? definition.name ?? definition.id;
    });
  }
}
