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

/**
 * 解析工厂
 */
export class ManagedResolverFactory {
  private creating = new Map<string, boolean>();
  singletonCache = new Map<ObjectIdentifier, any>();
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

    const pendingInitQueue = new Map<
      any,
      [() => any, (newValue: any) => void]
    >();
    const pendingObjectCache = new Map<string, any>();
    const instance = this.createInstance(
      identifier,
      name,
      args,
      definition,
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

    const pendingInitQueue = new Map<
      any,
      [() => Promise<any>, (newValue: any) => void]
    >();
    const pendingObjectCache = new Map<string, any>();
    const instance = this.createInstance(
      identifier,
      definition?.name ?? name,
      args,
      definition,
      true,
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
    for (const key of this.singletonCache.keys()) {
      const definition = this.getObjectDefinition(key);
      if (definition.creator) {
        const inst = this.singletonCache.get(key);
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
    }
    this.singletonCache.clear();
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
    currentContext: IMidwayContainer,
    pendingObjectCache: Map<string, any>,
    pendingInitQueue: Map<any, [() => any, (newValue: any) => void]>,
    creationPath: string[] = [],
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
        creationPath
      );
    }

    if (definition.isSingletonScope()) {
      currentContext = this.context;
      if (this.singletonCache.has(definition.id)) {
        debug(
          `[core]: "${definition.id}(${definition.name})" get from singleton cache.`
        );
        return this.singletonCache.get(definition.id);
      }
    }

    if (pendingObjectCache.has(definition.id)) {
      return pendingObjectCache.get(definition.id);
    }

    creationPath.push(
      definition.path?.name ?? definition.name ?? definition.id
    );

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
          currentContext,
          pendingObjectCache,
          pendingInitQueue,
          [...creationPath]
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
        debug('[core]: constructor arg "%s(%s)", pos=%s, in "%s".', arg.id, arg.name, arg.parameterIndex, name);
        constructorArgs[i] = this.createInstance(
          arg.id,
          arg.name,
          [],
          undefined,
          isAsync,
          currentContext,
          pendingObjectCache,
          pendingInitQueue,
          [...creationPath]
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
        debug('[core]: property "%s(%s)", in "%s".', resolver.id || resolver.name, resolver.name, name);
        inst[key] = this.createInstance(
          resolver.id || resolver.name,
          resolver.name,
          resolver.args,
          undefined,
          isAsync,
          currentContext,
          pendingObjectCache,
          pendingInitQueue,
          [...creationPath],
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

    // Set init function to pending init queue
    if (isAsync) {
      pendingInitQueue.set(inst, [
        () => definition.creator.doInitAsync(inst, currentContext),
        replaceCallback,
      ]);
    } else {
      pendingInitQueue.set(inst, [
        () => definition.creator.doInit(inst, currentContext),
        replaceCallback,
      ]);
    }

    return inst;
  }

  private initializeInstance(
    instance: any,
    definition: IObjectDefinition,
    pendingInitQueue: Map<any, [() => any, (newValue: any) => void]>
  ): any {
    const initializingSet = new Map<string, any>();
    const initializedInstances = new Map<string, any>();

    const dfs = (obj: any, def: IObjectDefinition, path: any[] = []) => {
      if (!pendingInitQueue.has(obj) || initializedInstances.has(def.id))
        return;
      if (initializingSet.has(def.id)) {
        const cycle = path.slice(path.indexOf(obj)).concat(obj);
        throw new MidwayCommonError(
          `Circular dependency detected: ${cycle
            .map(o => o.constructor.name)
            .join(' -> ')}`
        );
      }

      initializingSet.set(def.id, obj);
      path.push(obj);

      try {
        if (def.constructorArgs && def.constructorArgs.length) {
          for (const arg of def.constructorArgs) {
            const argDef = this.getObjectDefinition(arg.id);
            if (argDef) {
              dfs(obj, argDef, [...path]);
            }
          }
        }
        // 初始化所有的依赖
        if (def.properties) {
          const keys = Array.from(def.properties.keys());
          for (const key of keys) {
            const propertyValue = obj[key];
            if (propertyValue) {
              const resolver = def.properties.get(key);
              const propertyDefinition = this.getObjectDefinition(
                resolver.id ?? resolver.name
              );
              dfs(propertyValue, propertyDefinition, [...path]);
            }
          }
        }

        // 初始化当前对象
        const initFunc = pendingInitQueue.get(obj);
        if (initFunc) {
          debug('[core]: run init object "%s(%s)".', def.id, def.name);
          const res = initFunc[0]();
          if (def instanceof FunctionDefinition) {
            initializedInstances.set(def.id, res);
            // replace property value
            initFunc[1]?.(res);
          } else {
            initializedInstances.set(def.id, obj);
          }
        }
      } finally {
        path.pop();
        initializingSet.delete(def.id);
        this.storeInstanceScope(obj, def);

        this.getObjectEventTarget().emit(
          ObjectLifeCycleEvent.AFTER_INIT,
          instance,
          {
            context: this.getCurrentMatchedContext(instance),
            definition,
          }
        );
      }
    };

    dfs(instance, definition);
    return initializedInstances.get(definition.id);
  }

  private async initializeInstanceAsync(
    instance: any,
    definition: IObjectDefinition,
    pendingInitQueue: Map<any, [() => Promise<void>, (newValue: any) => void]>
  ): Promise<any> {
    const initializingSet = new Map<string, any>();
    const initializedInstances = new Map<string, any>();

    const dfs = async (obj: any, def: IObjectDefinition, path: any[] = []) => {
      if (!pendingInitQueue.has(obj) || initializedInstances.has(def.id))
        return;
      if (initializingSet.has(def.id)) {
        const cycle = path.slice(path.indexOf(obj)).concat(obj);
        throw new MidwayCommonError(
          `Circular dependency detected: ${cycle
            .map(o => o.constructor.name)
            .join(' -> ')}`
        );
      }

      initializingSet.set(def.id, obj);
      path.push(obj);

      try {
        if (def.constructorArgs && def.constructorArgs.length) {
          for (const arg of def.constructorArgs) {
            const argDef = this.getObjectDefinition(arg.id);
            if (argDef) {
              await dfs(obj, argDef, [...path]);
            }
          }
        }
        // 初始化所有的依赖
        if (def.properties) {
          const keys = Array.from(def.properties.keys());
          for (const key of keys) {
            const propertyValue = obj[key];
            if (propertyValue) {
              const resolver = def.properties.get(key);
              const propertyDefinition = this.getObjectDefinition(
                resolver.id ?? resolver.name
              );
              await dfs(propertyValue, propertyDefinition, [...path]);
            }
          }
        }

        // 初始化当前对象
        const initFunc = pendingInitQueue.get(obj);
        if (initFunc) {
          const res = await initFunc[0]();
          if (def instanceof FunctionDefinition) {
            initializedInstances.set(def.id, res);
            // replace property value
            initFunc[1]?.(res);
          } else {
            initializedInstances.set(def.id, obj);
          }
        }
      } finally {
        path.pop();
        initializingSet.delete(def.id);
        this.storeInstanceScope(obj, def);

        this.getObjectEventTarget().emit(
          ObjectLifeCycleEvent.AFTER_INIT,
          instance,
          {
            context: this.getCurrentMatchedContext(instance),
            definition,
          }
        );
      }
    };

    await dfs(instance, definition);
    return initializedInstances.get(definition.id);
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
        this.singletonCache.set(definition.id, instance);
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
}
