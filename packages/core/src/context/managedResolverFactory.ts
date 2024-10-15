/**
 * 管理对象解析构建
 */
import {
  CONTAINER_OBJ_SCOPE,
  REQUEST_CTX_KEY,
  REQUEST_OBJ_CTX_KEY,
  SINGLETON_CONTAINER_CTX,
} from '../constants';
import {
  ClassType,
  IMidwayContainer,
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
  context: IMidwayContainer;

  constructor(context: IMidwayContainer) {
    this.context = context;
  }

  /**
   * 同步创建对象
   * @param opt
   */
  create<T = any>(identifier, definition: IObjectDefinition, args = []): T {
    const name = identifier.name ?? identifier;
    identifier = this.context.getIdentifier(identifier);
    if (this.context.registry.hasObject(identifier)) {
      return this.context.registry.getObject(identifier);
    }

    if (!definition) {
      definition = this.getObjectDefinition(identifier);
      if (!definition) {
        throw new MidwayDefinitionNotFoundError(identifier, name);
      }
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
      this.context,
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

  async createAsync<T = any>(identifier, definition, args = []): Promise<T> {
    const name = identifier.name ?? identifier;
    identifier = this.context.getIdentifier(identifier);
    if (this.context.registry.hasObject(identifier)) {
      return this.context.registry.getObject(identifier);
    }

    if (!definition) {
      definition = this.getObjectDefinition(identifier);

      if (!definition) {
        throw new MidwayDefinitionNotFoundError(identifier, name);
      }
    }

    const pendingInitQueue = new Map<
      any,
      [() => Promise<any>, (newValue: any) => void]
    >();
    const pendingObjectCache = new Map<string, any>();
    const instance = this.createInstance(
      identifier,
      definition.name,
      args,
      definition,
      true,
      this.context,
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
      const definition = this.context.registry.getDefinition(key);
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
    if (this.context.parent) {
      return this.context.parent.objectCreateEventTarget;
    }
    return this.context.objectCreateEventTarget;
  }

  private checkSingletonInvokeRequest(definition, key, context) {
    if (definition.isSingletonScope()) {
      const managedRef: PropertyInjectMetadata = definition.properties.get(key);
      if (context.hasDefinition(managedRef?.id)) {
        const propertyDefinition = context.registry.getDefinition(
          managedRef.id
        );
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
    context: IMidwayContainer,
    pendingObjectCache: Map<string, any>,
    pendingInitQueue: Map<any, [() => any, (newValue: any) => void]>,
    creationPath: string[] = [],
    replaceCallback?: (newValue: any) => void
  ): any {
    identifier = context.getIdentifier(identifier);
    if (context.registry.hasObject(identifier)) {
      return context.registry.getObject(identifier);
    }

    if (!definition) {
      definition = this.getObjectDefinition(identifier);
      if (!definition) {
        throw new MidwayDefinitionNotFoundError(
          identifier as string,
          name,
          creationPath
        );
      }
    }

    let currentContext = context;

    if (definition.isSingletonScope()) {
      currentContext = context.parent ?? context;
      if (
        currentContext['getManagedResolverFactory']().singletonCache.has(
          definition.id
        )
      ) {
        debug(
          `id = ${definition.id}(${definition.name}) get from singleton cache.`
        );
        return currentContext['getManagedResolverFactory']().singletonCache.get(
          definition.id
        );
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
        debug('id = %s init depend %s.', definition.id, dep);
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
    let constructorArgs = [];
    if (args && Array.isArray(args) && args.length > 0) {
      constructorArgs = args;
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
      debug('id = %s inject ctx', definition.id);
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
      const keys = definition.properties.propertyKeys() as string[];
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
    // let newInstance;

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
        // 初始化所有的依赖
        if (def.properties) {
          const keys = def.properties.propertyKeys() as string[];
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
            context: this.getRootContext(this.context),
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
    // let newInstance;

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
        // 初始化所有的依赖
        if (def.properties) {
          const keys = def.properties.propertyKeys() as string[];
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
            context: this.getRootContext(this.context),
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
          `id = ${definition.id}(${definition.name}) set to singleton cache`
        );
        if (this.context.parent) {
          this.context.parent['getManagedResolverFactory']().singletonCache.set(
            definition.id,
            instance
          );
        } else {
          this.singletonCache.set(definition.id, instance);
        }
        this.setInstanceScope(instance, ScopeEnum.Singleton);
      } else if (definition.isRequestScope()) {
        debug(
          `id = ${definition.id}(${definition.name}) set to register object`
        );
        this.context.registerObject(definition.id, instance);
        this.setInstanceScope(instance, ScopeEnum.Request);
      } else {
        this.setInstanceScope(instance, ScopeEnum.Prototype);
      }
    }
  }

  private getObjectDefinition(identifier: ObjectIdentifier): IObjectDefinition {
    let definition = this.context.registry.getDefinition(identifier);
    if (!definition && this.context.parent) {
      definition = this.context.parent.registry.getDefinition(identifier);
    }
    return definition;
  }

  private getRootContext(context: IMidwayContainer): IMidwayContainer {
    return context.parent ?? context;
  }
}
