/**
 * 管理对象解析构建
 */

import * as _ from 'lodash';
import { KEYS, VALUE_TYPE } from './constants';
import {
  ManagedJSON,
  ManagedList,
  ManagedMap,
  ManagedObject,
  ManagedProperties,
  ManagedProperty,
  ManagedReference,
  ManagedSet,
  ManagedValue
} from './managed';
import {
  IApplicationContext,
  IManagedInstance,
  IManagedResolver,
  IObjectDefinition,
  ObjectIdentifier
} from '../../interfaces';
import { ObjectConfiguration } from '../../base/Configuration';
import { Autowire } from './Autowire';
import { NotFoundError } from '../../utils/errorFactory';


// 基础模版，用于 {{xxx.xx}} 这种形式的属性注入
function tpl(s: string, props: any): string {
  return _.template(s, {
    // use `{{` and `}}` as delimiters
    interpolate: /{{([\s\S]+?)}}/g
  })(props);
}

/**
 * 所有解析器基类
 */
class BaseManagedResolver implements IManagedResolver {
  protected _factory: ManagedResolverFactory;

  constructor(factory: ManagedResolverFactory) {
    this._factory = factory;
  }

  get type(): string {
    throw new Error('not implement');
  }

  resolve(managed: IManagedInstance, props: any): any {
    throw new Error('not implement');
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    throw new Error('not implement');
  }
}

/**
 * 解析json
 */
class JSONResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.JSON_ELEMENT;
  }

  resolve(managed: IManagedInstance, props: any): any {
    const mjson = <ManagedJSON>managed;
    return JSON.parse(tpl(mjson.value, props));
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    return this.resolve(managed, props);
  }
}

/**
 * 解析值
 */
class ValueResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.VALUE_ELEMENT;
  }

  /**
   * 解析不通类型的值
   * @param managed 类型接口
   * @param props 注入的属性值
   */
  _resolveCommon(managed: IManagedInstance, props: any): any {
    const mv = <ManagedValue>managed;
    switch (mv.valueType) {
      case VALUE_TYPE.STRING:
      case VALUE_TYPE.TEMPLATE:
        return tpl(mv.value, props);
      case VALUE_TYPE.NUMBER:
        return Number(tpl(mv.value, props));
      case VALUE_TYPE.INTEGER:
        return parseInt(tpl(mv.value, props), 10);
      case VALUE_TYPE.DATE:
        return new Date(tpl(mv.value, props));
      case VALUE_TYPE.BOOLEAN:
        return mv.value === 'true';
    }

    return mv.value;
  }

  resolve(managed: IManagedInstance, props: any): any {
    const mv = <ManagedValue>managed;
    if (mv.valueType === VALUE_TYPE.MANAGED) {
      return this._factory.resolveManaged(mv.value);
    } else {
      return this._resolveCommon(managed, props);
    }
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    const mv = <ManagedValue>managed;
    if (mv.valueType === VALUE_TYPE.MANAGED) {
      return await this._factory.resolveManagedAsync(mv.value);
    } else {
      return this._resolveCommon(managed, props);
    }
  }
}

/**
 * 解析ref
 */
class RefResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.REF_ELEMENT;
  }

  resolve(managed: IManagedInstance, props: any): any {
    const mr = <ManagedReference>managed;
    return this._factory.context.get(mr.name, null);
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    const mr = <ManagedReference>managed;
    return await this._factory.context.getAsync(mr.name, null);
  }
}

/**
 * 解析 list
 */
class ListResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.LIST_ELEMENT;
  }

  resolve(managed: IManagedInstance, props: any): any {
    const ml = <ManagedList>managed;
    const arr = [];
    for (let i = 0; i < ml.length; i++) {
      arr.push(this._factory.resolveManaged(ml[i]));
    }
    return arr;
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    const ml = <ManagedList>managed;
    const arr = [];
    for (let i = 0; i < ml.length; i++) {
      arr.push(await this._factory.resolveManagedAsync(ml[i]));
    }
    return arr;
  }
}

/**
 * 解析set
 */
class SetResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.SET_ELEMENT;
  }

  resolve(managed: IManagedInstance, props: any): any {
    const ms = <ManagedSet>managed;
    const s = new Set();
    for (let item of ms) {
      s.add(this._factory.resolveManaged(item));
    }
    return s;
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    const ms = <ManagedSet>managed;
    const s = new Set();
    for (let item of ms) {
      s.add(await this._factory.resolveManagedAsync(item));
    }
    return s;
  }
}

/**
 * 解析map
 */
class MapResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.MAP_ELEMENT;
  }

  resolve(managed: IManagedInstance, props: any): any {
    const mm = <ManagedMap>managed;
    const m = new Map();
    for (let key of mm.keys()) {
      m.set(key, this._factory.resolveManaged(mm.get(key)));
    }
    return m;
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    const mm = <ManagedMap>managed;
    const m = new Map();
    for (let key of mm.keys()) {
      m.set(key, await this._factory.resolveManagedAsync(mm.get(key)));
    }
    return m;
  }
}

/**
 * 解析properties
 */
class PropertiesResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.PROPS_ELEMENT;
  }

  resolve(managed: IManagedInstance, props: any): any {
    const m = <ManagedProperties>managed;
    const cfg = new ObjectConfiguration();
    const keys = m.keys();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      cfg.setProperty(key, this._factory.resolveManaged(m.getProperty(key)));
    }
    return cfg;
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    const m = <ManagedProperties>managed;
    const cfg = new ObjectConfiguration();
    const keys = m.keys();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      cfg.setProperty(key, await this._factory.resolveManagedAsync(m.getProperty(key)));
    }
    return cfg;
  }
}

/**
 * 解析property
 */
class PropertyResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.PROPERTY_ELEMENT;
  }

  resolve(managed: IManagedInstance, props: any): any {
    const mp = <ManagedProperty>managed;
    return this._factory.resolveManaged(mp.value);
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    const mp = <ManagedProperty>managed;
    return await this._factory.resolveManagedAsync(mp.value);
  }
}

/**
 * 解析 object
 */
class ObjectResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.OBJECT_ELEMENT;
  }

  resolve(managed: IManagedInstance, props: any): any {
    const mo = <ManagedObject>managed;
    return this._factory.create(mo.definition, null);
  }

  async resolveAsync(managed: IManagedInstance, props: any): Promise<any> {
    const mo = <ManagedObject>managed;
    return await this._factory.createAsync(mo.definition, null);
  }
}

/**
 * 解析工厂
 */
export class ManagedResolverFactory {
  private resolvers = new Map<string, IManagedResolver>();
  private _props = null;
  singletonCache = new Map<ObjectIdentifier, any>();
  context: IApplicationContext;
  afterCreateHandler = [];
  beforeCreateHandler = [];

  constructor(context: IApplicationContext) {
    this.context = context;

    // 初始化解析器
    this.registerResolver(new JSONResolver(this));
    this.registerResolver(new ValueResolver(this));
    this.registerResolver(new ListResolver(this));
    this.registerResolver(new SetResolver(this));
    this.registerResolver(new MapResolver(this));
    this.registerResolver(new PropertiesResolver(this));
    this.registerResolver(new PropertyResolver(this));
    this.registerResolver(new ObjectResolver(this));
    this.registerResolver(new RefResolver(this));
  }

  get props() {
    if (!this._props) {
      this._props = this.context.props.toJSON();
    }
    return this._props;
  }

  registerResolver(resolver: IManagedResolver) {
    this.resolvers.set(resolver.type, resolver);
  }

  resolveManaged(managed: IManagedInstance): any {
    if (!this.resolvers.has(managed.type)) {
      throw new Error(`${managed.type} resolver is not exists!`);
    }
    return this.resolvers.get(managed.type).resolve(managed, this.props);
  }

  async resolveManagedAsync(managed: IManagedInstance): Promise<any> {
    if (!this.resolvers.has(managed.type)) {
      throw new Error(`${managed.type} resolver is not exists!`);
    }
    return await this.resolvers.get(managed.type).resolveAsync(managed, this.props);
  }

  /**
   * 同步创建对象
   * @param definition 对象定义
   * @param args 参数
   */
  create(definition: IObjectDefinition, args: any): any {
    if (definition.isSingletonScope() &&
      this.singletonCache.has(definition.id)) {
      return this.singletonCache.get(definition.id);
    }

    // 预先初始化依赖
    if (definition.hasDependsOn()) {
      for (let i = 0; i < definition.dependsOn.length; i++) {
        this.context.get(definition.dependsOn[i], args);
      }
    }

    const Clzz = definition.creator.load();

    let constructorArgs = [];
    if (args && _.isArray(args) && args.length > 0) {
      constructorArgs = args;
    } else {
      if (definition.constructorArgs) {
        for (let i = 0; i < definition.constructorArgs.length; i++) {
          constructorArgs.push(this.resolveManaged(definition.constructorArgs[i]));
        }
      }
    }

    for (let handler of this.beforeCreateHandler) {
      handler.call(this, Clzz, constructorArgs, this.context);
    }

    const inst = definition.creator.doConstruct(Clzz, constructorArgs);

    if (definition.properties) {
      const keys = definition.properties.keys();
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const identifier = definition.properties.getProperty(key);
        try {
          inst[key] = this.resolveManaged(identifier);
        } catch (error) {
          if(NotFoundError.isClosePrototypeOf(error)) {
            const className = definition.path.name;
            error.updateErrorMsg(className);
          }
          throw error;
        }
      }
    }

    if (definition.isAutowire()) {
      Autowire.patchInject(inst, this.context);
      Autowire.patchNoDollar(inst, this.context);
    }

    for (let handler of this.afterCreateHandler) {
      handler.call(this, inst, this.context, definition);
    }

    // after properties set then do init
    definition.creator.doInit(inst);

    if (definition.isSingletonScope() && definition.id) {
      this.singletonCache.set(definition.id, inst);
    }

    return inst;
  }

  /**
   * 异步创建对象
   * @param definition 对象定义
   * @param args 参数
   */
  async createAsync(definition: IObjectDefinition, args: any): Promise<any> {
    if (definition.isSingletonScope() &&
      this.singletonCache.has(definition.id)) {
      return this.singletonCache.get(definition.id);
    }

    // 预先初始化依赖
    if (definition.hasDependsOn()) {
      for (let i = 0; i < definition.dependsOn.length; i++) {
        await this.context.getAsync(definition.dependsOn[i], args);
      }
    }

    const Clzz = definition.creator.load();
    let constructorArgs;
    if (args && _.isArray(args) && args.length > 0) {
      constructorArgs = args;
    } else {
      constructorArgs = [];
      if (definition.constructorArgs) {
        for (let i = 0; i < definition.constructorArgs.length; i++) {
          constructorArgs.push(await this.resolveManagedAsync(definition.constructorArgs[i]));
        }
      }
    }

    for (let handler of this.beforeCreateHandler) {
      handler.call(this, Clzz, constructorArgs, this.context);
    }

    const inst = await definition.creator.doConstructAsync(Clzz, constructorArgs);
    if (!inst) {
      throw new Error(`${definition.id} config no valid path`);
    }

    if (definition.properties) {
      const keys = definition.properties.keys();
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const identifier = definition.properties.getProperty(key);
        try {
          inst[key] = await this.resolveManagedAsync(identifier);
        } catch (error) {
          if(NotFoundError.isClosePrototypeOf(error)) {
            const className = definition.path.name;
            error.updateErrorMsg(className);
          }
          throw error;
        }
      }
    }

    if (definition.isAutowire()) {
      Autowire.patchInject(inst, this.context);
      Autowire.patchNoDollar(inst, this.context);
    }

    for (let handler of this.afterCreateHandler) {
      handler.call(this, inst, this.context, definition);
    }

    // after properties set then do init
    await definition.creator.doInitAsync(inst);

    if (definition.isSingletonScope() && definition.id) {
      this.singletonCache.set(definition.id, inst);
    }

    return inst;
  }

  async destroyCache(): Promise<void> {
    for (let key of this.singletonCache.keys()) {
      const definition = this.context.registry.getDefinition(key);
      if (definition.creator) {
        await definition.creator.doDestroyAsync(this.singletonCache.get(key));
      }
    }
    this.singletonCache.clear();
  }

  beforeEachCreated(fn: (Clzz: any, constructorArgs: Array<any>, context: IApplicationContext) => void) {
    this.beforeCreateHandler.push(fn);
  }

  afterEachCreated(fn: (ins: any, context: IApplicationContext, definition?: IObjectDefinition) => void) {
    this.afterCreateHandler.push(fn);
  }

}
