/**
 * 管理对象解析构建
 */
import {
  CONTAINER_OBJ_SCOPE,
  KEYS,
  REQUEST_CTX_KEY,
  REQUEST_OBJ_CTX_KEY,
  SINGLETON_CONTAINER_CTX,
} from '../constants';
import {
  IManagedInstance,
  IManagedResolver,
  IMidwayContainer,
  InjectModeEnum,
  IObjectDefinition,
  ObjectIdentifier,
  ObjectLifeCycleEvent,
  ScopeEnum,
} from '../interface';

import * as util from 'util';
import * as EventEmitter from 'events';
import {
  MidwayCommonError,
  MidwayDefinitionNotFoundError,
  MidwayInconsistentVersionError,
  MidwayMissingImportComponentError,
  MidwayResolverMissingError,
  MidwaySingletonInjectRequestError,
} from '../error';
import { FunctionDefinition } from '../definitions/functionDefinition';

const debug = util.debuglog('midway:debug');

export class ManagedReference implements IManagedInstance {
  type = KEYS.REF_ELEMENT;
  name: string;
  injectMode: InjectModeEnum;
  args?: any;
}

/**
 * 解析ref
 */
class RefResolver {
  constructor(readonly factory: ManagedResolverFactory) {}
  get type(): string {
    return KEYS.REF_ELEMENT;
  }

  resolve(managed: IManagedInstance, originName: string): any {
    const mr = managed as ManagedReference;
    if (
      mr.injectMode === InjectModeEnum.Class &&
      !(this.factory.context.parent ?? this.factory.context).hasDefinition(
        mr.name
      )
    ) {
      if (originName === 'loggerService') {
        throw new MidwayInconsistentVersionError();
      } else {
        throw new MidwayMissingImportComponentError(originName);
      }
    }
    return this.factory.context.get(mr.name, mr.args);
  }

  async resolveAsync(
    managed: IManagedInstance,
    originName: string
  ): Promise<any> {
    const mr = managed as ManagedReference;
    if (
      mr.injectMode === InjectModeEnum.Class &&
      !(this.factory.context.parent ?? this.factory.context).hasDefinition(
        mr.name
      )
    ) {
      if (originName === 'loggerService') {
        throw new MidwayInconsistentVersionError();
      } else {
        throw new MidwayMissingImportComponentError(originName);
      }
    }
    return this.factory.context.getAsync(mr.name, mr.args);
  }
}

/**
 * 解析工厂
 */
export class ManagedResolverFactory {
  private resolvers = {};
  private creating = new Map<string, boolean>();
  singletonCache = new Map<ObjectIdentifier, any>();
  context: IMidwayContainer;

  constructor(context: IMidwayContainer) {
    this.context = context;

    // 初始化解析器
    this.resolvers = {
      ref: new RefResolver(this),
    };
  }

  registerResolver(resolver: IManagedResolver) {
    this.resolvers[resolver.type] = resolver;
  }

  resolveManaged(managed: IManagedInstance, originPropertyName: string): any {
    const resolver = this.resolvers[managed.type];
    if (!resolver || resolver.type !== managed.type) {
      throw new MidwayResolverMissingError(managed.type);
    }
    return resolver.resolve(managed, originPropertyName);
  }

  async resolveManagedAsync(
    managed: IManagedInstance,
    originPropertyName: string
  ): Promise<any> {
    const resolver = this.resolvers[managed.type];
    if (!resolver || resolver.type !== managed.type) {
      throw new MidwayResolverMissingError(managed.type);
    }
    return resolver.resolveAsync(managed, originPropertyName);
  }

  /**
   * 同步创建对象
   * @param opt
   */
  create<T = any>(identifier, args = []): T {
    let name = identifier.name ?? identifier;
    identifier = this.context.getIdentifier(identifier);
    if (this.context.registry.hasObject(identifier)) {
      return this.context.registry.getObject(identifier);
    }

    const definition = this.context.registry.getDefinition(identifier);
    if (!definition && this.context.parent) {
      return this.context.parent.get(identifier, args);
    }

    if (!definition) {
      throw new MidwayDefinitionNotFoundError(name);
    }
    const pendingInitQueue = new Map<any, [() => any, (newValue: any) => void]>();
    const pendingObjectCache = new Map<string, any>();
    const instance = this.createInstance(definition, args, false, pendingObjectCache, pendingInitQueue);
    pendingObjectCache.clear();
    const newInstance = this.initializeInstance(instance, definition, pendingInitQueue);
    return newInstance ?? instance;
  }

  async createAsync<T = any>(identifier, args = []): Promise<T> {
    let name = identifier.name ?? identifier;
    identifier = this.context.getIdentifier(identifier);
    if (this.context.registry.hasObject(identifier)) {
      return this.context.registry.getObject(identifier);
    }

    const definition = this.context.registry.getDefinition(identifier);
    if (!definition && this.context.parent) {
      return this.context.parent.getAsync(identifier, args);
    }

    if (!definition) {
      throw new MidwayDefinitionNotFoundError(name);
    }

    const pendingInitQueue = new Map<any, [() => Promise<any>, (newValue: any) => void]>();
    const pendingObjectCache = new Map<string, any>();
    const instance = this.createInstance(definition, args, true, pendingObjectCache, pendingInitQueue);
    pendingObjectCache.clear();
    const newInstance = await this.initializeInstanceAsync(instance, definition, pendingInitQueue);
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

  private checkSingletonInvokeRequest(definition, key) {
    if (definition.isSingletonScope()) {
      const managedRef = definition.properties.get(key);
      if (this.context.hasDefinition(managedRef?.name)) {
        const propertyDefinition = this.context.registry.getDefinition(
          managedRef.name
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

  private createInstance(definition: IObjectDefinition, args = [], isAsync: boolean, pendingObjectCache: Map<string, any>, pendingInitQueue: Map<any, [() => any, (newValue: any) => void]>, creationPath: string[] = [], replaceCallback?: (newValue: any) => void): any {
    if (this.context.registry.hasObject(definition.id)) {
      return this.context.registry.getObject(definition.id);
    }

    if (
      definition.isSingletonScope() &&
      this.singletonCache.has(definition.id)
    ) {
      debug(
        `id = ${definition.id}(${definition.name}) get from singleton cache.`
      );
      return this.singletonCache.get(definition.id);
    }

    if (pendingObjectCache.has(definition.id)) {
      return pendingObjectCache.get(definition.id);
    }

    creationPath.push(definition.path?.name ?? definition.name ?? definition.id);

    // Pre-initialize dependencies
    if (definition.hasDependsOn()) {
      for (const dep of definition.dependsOn) {
        debug('id = %s init depend %s.', definition.id, dep);
        const depDefinition = this.context.registry.getDefinition(dep);
        if (!depDefinition) {
          throw new MidwayDefinitionNotFoundError(dep as string, creationPath);
        }
        this.createInstance(depDefinition, depDefinition.constructorArgs, isAsync, pendingObjectCache, pendingInitQueue, [...creationPath]);
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
        context: this.context,
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
        value: this.context.get(REQUEST_CTX_KEY),
        writable: false,
        enumerable: false,
      });
    }

    pendingObjectCache.set(definition.id, inst);

    // Set properties
    if (definition.properties) {
      const keys = definition.properties.propertyKeys() as string[];
      for (const key of keys) {
        this.checkSingletonInvokeRequest(definition, key);
        const resolver = definition.properties.get(key);
        const propertyDefinition = this.context.registry.getDefinition(resolver.name);
        if (!propertyDefinition) {
          throw new MidwayDefinitionNotFoundError(resolver.name, creationPath);
        }
        inst[key] = this.createInstance(propertyDefinition, resolver.args, isAsync, pendingObjectCache, pendingInitQueue, [...creationPath], (newValue) => {
          inst[key] = newValue;
        });
      }
    }

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_CREATED, inst, {
      context: this.context,
      definition,
      replaceCallback: ins => {
        inst = ins;
      },
    });

    // Set init function to pending init queue
    if (isAsync) {
      pendingInitQueue.set(inst, [() => definition.creator.doInitAsync(inst, this.context), replaceCallback]);
    } else {
      pendingInitQueue.set(inst, [() => definition.creator.doInit(inst, this.context), replaceCallback]);
    }

    return inst;
  }

  private initializeInstance(
    instance: any,
    definition: IObjectDefinition,
    pendingInitQueue: Map<any, [() => any, (newValue: any) => void]>,
  ): any {
    const initializingSet = new Map<string, any>();
    const initializedInstances = new Map<string, any>();
    // let newInstance;

    const dfs = (obj: any, def: IObjectDefinition, path: any[] = []) => {
      if (initializedInstances.has(def.id)) return;
      if (initializingSet.has(def.id)) {
        const cycle = path.slice(path.indexOf(obj)).concat(obj);
        throw new MidwayCommonError(`Circular dependency detected: ${cycle.map(o => o.constructor.name).join(' -> ')}`);
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
              const propertyDefinition = this.context.registry.getDefinition(resolver.name);
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

        this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_CREATED, instance, {
          context: this.context,
          definition,
          // replaceCallback: ins => {
          //   newInstance = ins;
          // },
        });
      }
    };

    dfs(instance, definition);
    return initializedInstances.get(definition.id);
  }

  private async initializeInstanceAsync(
    instance: any,
    definition: IObjectDefinition,
    pendingInitQueue: Map<any, [() => Promise<void>, (newValue: any) => void]>,
  ): Promise<any> {
    const initializingSet = new Map<string, any>();
    const initializedInstances = new Map<string, any>();
    // let newInstance;

    const dfs = async (obj: any, def: IObjectDefinition, path: any[] = []) => {
      if (initializedInstances.has(def.id)) return;
      if (initializingSet.has(def.id)) {
        const cycle = path.slice(path.indexOf(obj)).concat(obj);
        throw new MidwayCommonError(`Circular dependency detected: ${cycle.map(o => o.constructor.name).join(' -> ')}`);
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
              const propertyDefinition = this.context.registry.getDefinition(resolver.name);
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

        this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_CREATED, instance, {
          context: this.context,
          definition,
          // replaceCallback: ins => {
          //   newInstance = ins;
          // },
        });
      }
    };

    await dfs(instance, definition);
    return initializedInstances.get(definition.id);
  }

  private storeInstanceScope(instance: any, definition: IObjectDefinition): void {
    if (definition.id) {
      if (definition.isSingletonScope()) {
        debug(
          `id = ${definition.id}(${definition.name}) set to singleton cache`
        );
        this.singletonCache.set(definition.id, instance);
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
}
