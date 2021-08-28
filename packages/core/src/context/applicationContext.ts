/**
 * 基础的ObjectFactory和ApplicationContext实现
 */
import { ObjectIdentifier } from '@midwayjs/decorator';
import {
  IApplicationContext,
  IObjectDefinition,
  IObjectDefinitionRegistry,
  IObjectFactory,
  ObjectDependencyTree,
} from '../interface';
import { ObjectProperties } from '../definitions/properties';
import { ManagedResolverFactory } from './managedResolverFactory';
import { NotFoundError } from '../common/notFoundError';
import { PathFileUtil } from '../util/pathFileUtil';

const PREFIX = '_id_default_';

export class ObjectDefinitionRegistry
  extends Map
  implements IObjectDefinitionRegistry
{
  private singletonIds = [];

  get identifiers() {
    const ids = [];
    for (const key of this.keys()) {
      if (key.indexOf(PREFIX) === -1) {
        ids.push(key);
      }
    }
    return ids;
  }

  get count() {
    return this.size;
  }

  getSingletonDefinitionIds(): ObjectIdentifier[] {
    return this.singletonIds;
  }

  getDefinitionByName(name: string): IObjectDefinition[] {
    const definitions = [];
    for (const v of this.values()) {
      const definition = v as IObjectDefinition;
      if (definition.name === name) {
        definitions.push(definition);
      }
    }
    return definitions;
  }

  registerDefinition(
    identifier: ObjectIdentifier,
    definition: IObjectDefinition
  ) {
    if (definition.isSingletonScope()) {
      this.singletonIds.push(identifier);
    }
    this.set(identifier, definition);
  }

  getDefinition(identifier: ObjectIdentifier): IObjectDefinition {
    return this.get(identifier);
  }

  getDefinitionByPath(path: string): IObjectDefinition {
    for (const v of this.values()) {
      const definition = v as IObjectDefinition;
      if (definition.path === path) {
        return definition;
      }
    }
    return null;
  }

  removeDefinition(identifier: ObjectIdentifier): void {
    this.delete(identifier);
  }

  hasDefinition(identifier: ObjectIdentifier): boolean {
    return this.has(identifier);
  }

  clearAll(): void {
    this.singletonIds = [];
    this.clear();
  }

  hasObject(identifier: ObjectIdentifier): boolean {
    return this.has(PREFIX + identifier);
  }

  registerObject(identifier: ObjectIdentifier, target: any) {
    this.set(PREFIX + identifier, target);
  }

  getObject(identifier: ObjectIdentifier): any {
    return this.get(PREFIX + identifier);
  }
}

export class BaseApplicationContext
  implements IApplicationContext, IObjectFactory
{
  protected readied = false;
  // 自己内部实现的，可注入的 feature(见 features)
  protected midwayIdentifiers: string[] = [];
  private _resolverFactory: ManagedResolverFactory = null;
  private _registry: IObjectDefinitionRegistry = null;
  private _props: ObjectProperties = null;
  private _dependencyMap: Map<string, ObjectDependencyTree> = null;
  baseDir: string = null;
  parent: IApplicationContext = null;
  disableConflictCheck = false;

  constructor(baseDir = '', parent?: IApplicationContext) {
    this.parent = parent;
    this.baseDir = baseDir;

    this.init();
  }

  get dependencyMap(): Map<string, ObjectDependencyTree> {
    if (!this._dependencyMap) {
      this._dependencyMap = new Map();
    }
    return this._dependencyMap;
  }

  get props(): ObjectProperties {
    if (!this._props) {
      this._props = new ObjectProperties();
    }
    return this._props;
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

  protected getManagedResolverFactory() {
    if (!this._resolverFactory) {
      this._resolverFactory = new ManagedResolverFactory(this);
    }
    return this._resolverFactory;
  }

  /**
   * 继承实现时需要调用super
   */
  protected init(): void {}

  async stop(): Promise<void> {
    await this.getManagedResolverFactory().destroyCache();
    this.registry.clearAll();
    this.readied = false;
  }

  async ready(): Promise<void> {
    await this.loadDefinitions();
    this.readied = true;
  }

  protected loadDefinitions(): void {}

  isAsync(identifier: ObjectIdentifier): boolean {
    if (this.registry.hasDefinition(identifier)) {
      return this.registry.getDefinition(identifier).isAsync();
    }
    return false;
  }

  get<T>(identifier: { new (...args): T }, args?: any): T;
  get<T>(identifier: ObjectIdentifier, args?: any): T;
  get(identifier: any, args?: any): any {
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    if (this.isAsync(identifier)) {
      throw new Error(`${identifier} must use getAsync`);
    }

    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      if (this.parent.isAsync(identifier)) {
        throw new Error(`${identifier} must use getAsync`);
      }

      return this.parent.get(identifier, args);
    }
    if (!definition) {
      throw new NotFoundError(identifier);
    }
    return this.getManagedResolverFactory().create({ definition, args });
  }

  async getAsync<T>(identifier: { new (...args): T }, args?: any): Promise<T>;
  async getAsync<T>(identifier: ObjectIdentifier, args?: any): Promise<T>;
  async getAsync(identifier: any, args?: any): Promise<any> {
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      return this.parent.getAsync(identifier, args);
    }

    if (!definition) {
      throw new NotFoundError(identifier);
    }

    return this.getManagedResolverFactory().createAsync({ definition, args });
  }

  get isReady(): boolean {
    return this.readied;
  }

  /**
   * proxy registry.registerDefinition
   * @param {ObjectIdentifier} identifier
   * @param {IObjectDefinition} definition
   */
  registerDefinition(
    identifier: ObjectIdentifier,
    definition: IObjectDefinition
  ) {
    if (!this.disableConflictCheck && this.registry.hasDefinition(identifier)) {
      const def = this.registry.getDefinition(identifier);
      if (definition.srcPath && def.srcPath) {
        if (!PathFileUtil.isPathEqual(definition.srcPath, def.srcPath)) {
          throw new Error(
            `${identifier} path = ${definition.srcPath} already exist (${def.srcPath})!`
          );
        }
      }
    }
    this.registry.registerDefinition(identifier, definition);
    this.createObjectDependencyTree(identifier, definition);
  }

  /**
   * proxy registry.registerObject
   * @param {ObjectIdentifier} identifier
   * @param target
   */
  registerObject(identifier: ObjectIdentifier, target: any) {
    this.registry.registerObject(identifier, target);
  }

  /**
   * register handler after instance create
   * @param fn
   */
  afterEachCreated(
    fn: (
      ins: any,
      context: IApplicationContext,
      definition?: IObjectDefinition
    ) => void
  ) {
    this.getManagedResolverFactory().afterEachCreated(fn);
  }

  /**
   * register handler before instance create
   * @param fn
   */
  beforeEachCreated(
    fn: (
      Clzz: any,
      constructorArgs: any[],
      context: IApplicationContext
    ) => void
  ) {
    this.getManagedResolverFactory().beforeEachCreated(fn);
  }

  protected createObjectDependencyTree(identifier, definition) {
    if (!this.dependencyMap.has(identifier)) {
      let constructorArgs = definition.constructorArgs || [];
      constructorArgs = constructorArgs
        .map(ref => {
          return ref.name;
        })
        .filter(name => {
          return !!name;
        });

      const properties =
        (definition.properties &&
          definition.properties.keys().map(key => {
            return definition.properties.get(key).name;
          })) ||
        [];

      this.dependencyMap.set(identifier, {
        name:
          typeof definition.path !== 'string'
            ? definition.path.name
            : identifier,
        scope: definition.scope,
        constructorArgs,
        properties,
      });
    }
  }
}
