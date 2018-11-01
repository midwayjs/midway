/**
 * 基础的ObjectFactory和ApplicationContext实现
 */
import { EventEmitter } from 'events';
import {
  IApplicationContext,
  ILifeCycle,
  IMessageSource,
  IObjectDefinition,
  IObjectDefinitionRegistry,
  IObjectFactory,
  ObjectDependencyTree,
  ObjectIdentifier
} from '../interfaces';
import { ObjectConfiguration } from '../base/Configuration';
import { ManagedResolverFactory } from './common/ManagedResolverFactory';

const path = require('path');
// const fs = require('fs');

const graphviz = require('graphviz');

export const ContextEvent = {
  START: 'start',
  READY: 'onReady',
  ONREFRESH: 'onRefresh',
  STOP: 'stop'
};

const PREFIX = '_id_default_';

export class ObjectDefinitionRegistry extends Map implements IObjectDefinitionRegistry {
  get identifiers() {
    const ids = [];
    for (let key of this.keys()) {
      if (key.indexOf(PREFIX) === -1) {
        ids.push(key);
      }
    }
    return ids;
  }

  get count() {
    return this.size;
  }

  getDefinitionByName(name: string): IObjectDefinition[] {
    const definitions = [];
    for (let v of this.values()) {
      const definition = <IObjectDefinition>v;
      if (definition.name === name) {
        definitions.push(definition);
      }
    }
    return definitions;
  }

  registerDefinition(identifier: ObjectIdentifier, definition: IObjectDefinition) {
    this.set(identifier, definition);
  }

  getDefinition(identifier: ObjectIdentifier): IObjectDefinition {
    return this.get(identifier);
  }

  getDefinitionByPath(path: string): IObjectDefinition {
    for (let v of this.values()) {
      const definition = <IObjectDefinition>v;
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

export class BaseApplicationContext extends EventEmitter implements IApplicationContext, IObjectFactory {
  protected refreshing: boolean = false;
  protected readied: boolean = false;
  protected lifeCycles: ILifeCycle[] = [];
  protected resolverFactory: ManagedResolverFactory;
  baseDir: string;
  registry: IObjectDefinitionRegistry;
  parent: IApplicationContext;
  props: ObjectConfiguration = new ObjectConfiguration();
  configLocations: string[] = [];
  messageSource: IMessageSource;
  dependencyMap: Map<string, ObjectDependencyTree> = new Map();

  constructor(baseDir: string = process.cwd(), parent?: IApplicationContext) {
    super();
    this.parent = parent;
    this.baseDir = baseDir;

    this.registry = new ObjectDefinitionRegistry();
    this.resolverFactory = this.getManagedResolverFactory();

    this.init();
  }

  protected getManagedResolverFactory() {
    return new ManagedResolverFactory(this);
  }

  /**
   * 继承实现时需要调用super
   */
  protected init(): void {
  }

  async stop(): Promise<void> {
    await this.resolverFactory.destroyCache();
    this.registry.clearAll();
    this.readied = false;
    this.emit(ContextEvent.STOP);
  }

  async ready(): Promise<void> {
    return await this.refreshAsync();
  }

  async refreshAsync(): Promise<void> {
    if (this.refreshing) {
      return;
    }
    this.refreshing = true;
    this.emit(ContextEvent.ONREFRESH);
    await this.loadDefinitions(this.configLocations);
    this.refreshing = false;
    this.readied = true;
    this.emit(ContextEvent.READY);
  }

  protected loadDefinitions(configLocations?: string[]): void {
    // throw new Error('BaseApplicationContext not implement _loadDefinitions');
  }

  isAsync(identifier: ObjectIdentifier): boolean {
    if (this.registry.hasDefinition(identifier)) {
      this.registry.getDefinition(identifier).isAsync();
    }
    return false;
  }

  get<T>(identifier: ObjectIdentifier, args?: any): T {
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

      return this.parent.get<T>(identifier, args);
    }
    if (!definition) {
      throw new Error(`${identifier} is not valid in current context`);
    }
    return this.resolverFactory.create(definition, args);
  }

  async getAsync<T>(identifier: ObjectIdentifier, args?: any): Promise<T> {
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      return await this.parent.getAsync<T>(identifier, args);
    }

    if (!definition) {
      throw new Error(`${identifier} is not valid in current context`);
    }
    return await this.resolverFactory.createAsync(definition, args);
  }

  addLifeCycle(lifeCycle: ILifeCycle): void {
    this.lifeCycles.push(lifeCycle);

    this.on(ContextEvent.START, lifeCycle.onStart);
    this.on(ContextEvent.STOP, lifeCycle.onStop);
    this.on(ContextEvent.READY, lifeCycle.onReady);
    this.on(ContextEvent.ONREFRESH, lifeCycle.onRefresh);
  }

  removeLifeCycle(lifeCycle: ILifeCycle): void {
    let index = this.lifeCycles.indexOf(lifeCycle);
    if (index === -1) {
      for (let i = 0; i < this.lifeCycles.length; i++) {
        if (this.lifeCycles[i].key = lifeCycle.key) {
          index = i;
          break;
        }
      }
    }

    if (index > -1) {
      const aa = this.lifeCycles.splice(index, 1);
      for (let i = 0; i < aa.length; i++) {
        const tmp = aa[i];
        this.removeListener(ContextEvent.START, tmp.onStart);
        this.removeListener(ContextEvent.STOP, tmp.onStop);
        this.removeListener(ContextEvent.READY, tmp.onReady);
        this.removeListener(ContextEvent.ONREFRESH, tmp.onRefresh);
      }
    }
  }

  get isReady(): boolean {
    return this.readied;
  }

  /**
   * proxy registry.registerDefinition
   * @param {ObjectIdentifier} identifier
   * @param {IObjectDefinition} definition
   */
  registerDefinition(identifier: ObjectIdentifier, definition: IObjectDefinition) {
    this.registry.registerDefinition(identifier, definition);
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
  afterEachCreated(fn: (ins: any, context: IApplicationContext, definition?: IObjectDefinition) => void) {
    this.resolverFactory.afterEachCreated(fn);
  }

  /**
   * register handler before instance create
   * @param fn
   */
  beforeEachCreated(fn: (Clzz: any, constructorArgs: Array<any>, context: IApplicationContext) => void) {
    this.resolverFactory.beforeEachCreated(fn);
  }

  async dumpDependency(imagePath = path.join(process.cwd(), 'dependency.svg')) {
    const options: any = this.createGraphvizOptions({
      baseDir: null,
      excludeRegExp: false,
      fileExtensions: ['js'],
      includeNpm: false,
      requireConfig: null,
      webpackConfig: null,
      rankdir: 'LR',
      layout: 'dot',
      fontName: 'Arial',
      fontSize: '14px',
      backgroundColor: '#111111',
      nodeColor: '#c6c5fe',
      nodeShape: 'box',
      nodeStyle: 'rounded',
      noDependencyColor: '#cfffac',
      cyclicNodeColor: '#ff6c60',
      edgeColor: '#757575',
      graphVizOptions: false,
      graphVizPath: false,
      dependencyFilter: false
    });
    const g = graphviz.digraph('G');

    options.type = path.extname(imagePath).replace('.', '') || 'png';

    for (let [id, module] of this.dependencyMap.entries()) {

      g.addNode(module.name, {label: `${id}\nscope:${module.scope}\nasync:${module.isAsync}`});

      module.properties.forEach((depId) => {
        g.addEdge(module.name, depId, {label: `properties`});
      });

      module.constructorArgs.forEach((depId) => {
        g.addEdge(module.name, depId, {label: 'constructor'});
      });
    }

    try {
      console.log(g.to_dot());
      // fs.writeSync(imagePath, g.to_dot());
    } catch (err) {
      console.error('generate injection dependency tree fail, err = ', err.message);
    }
  }

  private createGraphvizOptions(config) {
    const graphVizOptions = config.graphVizOptions || {};

    return {
      G: Object.assign({
        overlap: false,
        pad: 0.3,
        rankdir: config.rankdir,
        layout: config.layout,
        bgcolor: config.backgroundColor
      }, graphVizOptions.G),
      E: Object.assign({
        color: config.edgeColor
      }, graphVizOptions.E),
      N: Object.assign({
        fontname: config.fontName,
        fontsize: config.fontSize,
        color: config.nodeColor,
        shape: config.nodeShape,
        style: config.nodeStyle,
        height: 0,
        fontcolor: config.nodeColor
      }, graphVizOptions.N)
    };
  }

  // private setNodeColor(node, color) {
  //   node.set('color', color);
  //   node.set('fontcolor', color);
  // }
}

