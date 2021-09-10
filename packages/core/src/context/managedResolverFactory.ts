/**
 * 管理对象解析构建
 */
import { IManagedInstance, ObjectIdentifier } from '@midwayjs/decorator';
import * as _ from '../common/lodashWrap';
import { KEYS, VALUE_TYPE } from '../common/constants';
import {
  ManagedJSON,
  ManagedList,
  ManagedMap,
  ManagedObject,
  ManagedProperties,
  ManagedProperty,
  ManagedReference,
  ManagedSet,
  ManagedValue,
} from './managed';
import {
  IApplicationContext,
  IManagedResolver,
  IObjectDefinition,
  REQUEST_CTX_KEY,
  REQUEST_OBJ_CTX_KEY,
  IManagedResolverFactoryCreateOptions,
} from '../interface';
import { ObjectProperties } from '../definitions/properties';
import { NotFoundError } from '../common/notFoundError';
import * as util from 'util';

const debug = util.debuglog('midway:managedresolver');

/**
 * 所有解析器基类
 */
export class BaseManagedResolver implements IManagedResolver {
  protected _factory: ManagedResolverFactory;

  constructor(factory: ManagedResolverFactory) {
    this._factory = factory;
  }

  get type(): string {
    throw new Error('not implement');
  }

  resolve(managed: IManagedInstance): any {
    throw new Error('not implement');
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
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

  resolve(managed: IManagedInstance): any {
    const mjson = managed as ManagedJSON;
    return JSON.parse(this._factory.tpl(mjson.value));
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    return this.resolve(managed);
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
  _resolveCommon(managed: IManagedInstance): any {
    const mv = managed as ManagedValue;
    switch (mv.valueType) {
      case VALUE_TYPE.STRING:
      case VALUE_TYPE.TEMPLATE:
        return this._factory.tpl(mv.value);
      case VALUE_TYPE.NUMBER:
        return Number(this._factory.tpl(mv.value));
      case VALUE_TYPE.INTEGER:
        return parseInt(this._factory.tpl(mv.value), 10);
      case VALUE_TYPE.DATE:
        return new Date(this._factory.tpl(mv.value));
      case VALUE_TYPE.BOOLEAN:
        return mv.value === 'true';
    }

    return mv.value;
  }

  resolve(managed: IManagedInstance): any {
    const mv = managed as ManagedValue;
    if (mv.valueType === VALUE_TYPE.MANAGED) {
      return this._factory.resolveManaged(mv.value);
    } else {
      return this._resolveCommon(managed);
    }
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    const mv = managed as ManagedValue;
    if (mv.valueType === VALUE_TYPE.MANAGED) {
      return this._factory.resolveManagedAsync(mv.value);
    } else {
      return this._resolveCommon(managed);
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

  resolve(managed: IManagedInstance): any {
    const mr = managed as ManagedReference;
    return this._factory.context.get(mr.name, mr.args);
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    const mr = managed as ManagedReference;
    return this._factory.context.getAsync(mr.name, mr.args);
  }
}

/**
 * 解析 list
 */
class ListResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.LIST_ELEMENT;
  }

  resolve(managed: IManagedInstance): any {
    const ml = managed as ManagedList;
    const arr = [];
    for (const item of ml) {
      arr.push(this._factory.resolveManaged(item));
    }
    return arr;
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    const ml = managed as ManagedList;
    const arr = [];
    for (const item of ml) {
      arr.push(await this._factory.resolveManagedAsync(item));
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

  resolve(managed: IManagedInstance): any {
    const ms = managed as ManagedSet;
    const s = new Set();
    for (const item of ms) {
      s.add(this._factory.resolveManaged(item));
    }
    return s;
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    const ms = managed as ManagedSet;
    const s = new Set();
    for (const item of ms) {
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

  resolve(managed: IManagedInstance): any {
    const mm = managed as ManagedMap;
    const m = new Map();
    for (const key of mm.keys()) {
      m.set(key, this._factory.resolveManaged(mm.get(key)));
    }
    return m;
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    const mm = managed as ManagedMap;
    const m = new Map();
    for (const key of mm.keys()) {
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

  resolve(managed: IManagedInstance): any {
    const m = managed as ManagedProperties;
    const cfg = new ObjectProperties();
    const keys = m.keys();
    for (const key of keys) {
      cfg.setProperty(key, this._factory.resolveManaged(m.getProperty(key)));
    }
    return cfg;
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    const m = managed as ManagedProperties;
    const cfg = new ObjectProperties();
    const keys = m.keys();
    for (const key of keys) {
      cfg.setProperty(
        key,
        await this._factory.resolveManagedAsync(m.getProperty(key))
      );
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

  resolve(managed: IManagedInstance): any {
    const mp = managed as ManagedProperty;
    return this._factory.resolveManaged(mp.value);
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    const mp = managed as ManagedProperty;
    return this._factory.resolveManagedAsync(mp.value);
  }
}

/**
 * 解析 object
 */
class ObjectResolver extends BaseManagedResolver {
  get type(): string {
    return KEYS.OBJECT_ELEMENT;
  }

  resolve(managed: IManagedInstance): any {
    const mo = managed as ManagedObject;
    return this._factory.create({ definition: mo.definition });
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    const mo = managed as ManagedObject;
    return this._factory.createAsync({ definition: mo.definition });
  }
}

/**
 * 解析工厂
 */
export class ManagedResolverFactory {
  private resolvers = {};
  private _props = null;
  private creating = new Map<string, boolean>();
  singletonCache = new Map<ObjectIdentifier, any>();
  context: IApplicationContext;
  afterCreateHandler = [];
  beforeCreateHandler = [];

  constructor(context: IApplicationContext) {
    this.context = context;

    // 初始化解析器
    this.resolvers = {
      json: new JSONResolver(this),
      value: new ValueResolver(this),
      list: new ListResolver(this),
      set: new SetResolver(this),
      map: new MapResolver(this),
      props: new PropertiesResolver(this),
      property: new PropertyResolver(this),
      object: new ObjectResolver(this),
      ref: new RefResolver(this),
    };
  }

  get props() {
    if (!this._props) {
      this._props = this.context.props.toJSON();
    }
    return this._props;
  }

  /**
   * 用于解析模版化的值
   * example: {{aaa.bbb.ccc}}
   * @param value 配置的模版值
   */
  tpl(value) {
    if (typeof value === 'string' && value.indexOf('{{') > -1) {
      return _.template(value, {
        // use `{{` and `}}` as delimiters
        interpolate: /{{([\s\S]+?)}}/g,
      })(this.props);
    }
    return value;
  }

  registerResolver(resolver: IManagedResolver) {
    this.resolvers[resolver.type] = resolver;
  }

  resolveManaged(managed: IManagedInstance): any {
    const resolver = this.resolvers[managed.type];
    if (!resolver || resolver.type !== managed.type) {
      throw new Error(`${managed.type} resolver is not exists!`);
    }
    return resolver.resolve(managed);
  }

  async resolveManagedAsync(managed: IManagedInstance): Promise<any> {
    const resolver = this.resolvers[managed.type];
    if (!resolver || resolver.type !== managed.type) {
      throw new Error(`${managed.type} resolver is not exists!`);
    }
    return resolver.resolveAsync(managed);
  }

  /**
   * 同步创建对象
   * @param definition 对象定义
   * @param args 参数
   */
  create(opt: IManagedResolverFactoryCreateOptions): any {
    const { definition, args } = opt;
    if (
      definition.isSingletonScope() &&
      this.singletonCache.has(definition.id)
    ) {
      return this.singletonCache.get(definition.id);
    }
    // 如果非 null 表示已经创建 proxy
    let inst = this.createProxyReference(definition);
    if (inst) {
      return inst;
    }

    this.compareAndSetCreateStatus(definition);
    // 预先初始化依赖
    if (definition.hasDependsOn()) {
      for (const dep of definition.dependsOn) {
        this.context.get(dep, args);
      }
    }

    const Clzz = definition.creator.load();

    let constructorArgs = [];
    if (args && _.isArray(args) && args.length > 0) {
      constructorArgs = args;
    } else {
      if (definition.constructorArgs) {
        for (const arg of definition.constructorArgs) {
          constructorArgs.push(this.resolveManaged(arg));
        }
      }
    }

    for (const handler of this.beforeCreateHandler) {
      handler.call(this, Clzz, constructorArgs, this.context);
    }

    inst = definition.creator.doConstruct(Clzz, constructorArgs, this.context);

    // binding ctx object
    if (
      definition.isRequestScope() &&
      definition.constructor.name === 'ObjectDefinition'
    ) {
      Object.defineProperty(inst, REQUEST_OBJ_CTX_KEY, {
        value: this.context.get(REQUEST_CTX_KEY),
        writable: false,
        enumerable: false,
      });
    }

    if (definition.properties) {
      const keys = definition.properties.keys();
      for (const key of keys) {
        const identifier = definition.properties.getProperty(key);
        try {
          inst[key] = this.resolveManaged(identifier);
        } catch (error) {
          if (NotFoundError.isClosePrototypeOf(error)) {
            const className = definition.path.name;
            error.updateErrorMsg(className);
          }
          this.removeCreateStatus(definition, true);
          throw error;
        }
      }
    }

    for (const handler of this.afterCreateHandler) {
      handler.call(this, inst, this.context, definition);
    }

    // after properties set then do init
    definition.creator.doInit(inst);

    if (definition.isSingletonScope() && definition.id) {
      this.singletonCache.set(definition.id, inst);
    }

    // for request scope
    if (definition.isRequestScope() && definition.id) {
      this.context.registerObject(definition.id, inst);
    }
    this.removeCreateStatus(definition, true);

    return inst;
  }

  /**
   * 异步创建对象
   * @param definition 对象定义
   * @param args 参数
   */
  async createAsync(opt: IManagedResolverFactoryCreateOptions): Promise<any> {
    const { definition, args } = opt;
    if (
      definition.isSingletonScope() &&
      this.singletonCache.has(definition.id)
    ) {
      debug('id = %s from singleton cache.', definition.id);
      return this.singletonCache.get(definition.id);
    }

    // 如果非 null 表示已经创建 proxy
    let inst = this.createProxyReference(definition);
    if (inst) {
      debug('id = %s from proxy reference.', definition.id);
      return inst;
    }

    this.compareAndSetCreateStatus(definition);
    // 预先初始化依赖
    if (definition.hasDependsOn()) {
      for (const dep of definition.dependsOn) {
        debug('id = %s init depend %s.', definition.id, dep);
        await this.context.getAsync(dep, args);
      }
    }

    const Clzz = definition.creator.load();
    let constructorArgs;
    if (args && _.isArray(args) && args.length > 0) {
      constructorArgs = args;
    } else {
      if (definition.constructorArgs) {
        constructorArgs = [];
        for (const arg of definition.constructorArgs) {
          debug('id = %s resolve constructor arg %s.', definition.id, arg);
          constructorArgs.push(await this.resolveManagedAsync(arg));
        }
      }
    }

    for (const handler of this.beforeCreateHandler) {
      handler.call(this, Clzz, constructorArgs, this.context);
    }

    inst = await definition.creator.doConstructAsync(
      Clzz,
      constructorArgs,
      this.context
    );
    if (!inst) {
      this.removeCreateStatus(definition, false);
      throw new Error(`${definition.id} construct return undefined`);
    }

    // binding ctx object
    if (
      definition.isRequestScope() &&
      definition.constructor.name === 'ObjectDefinition'
    ) {
      debug('id = %s inject ctx', definition.id);
      Object.defineProperty(inst, REQUEST_OBJ_CTX_KEY, {
        value: this.context.get(REQUEST_CTX_KEY),
        writable: false,
        enumerable: false,
      });
    }

    if (definition.properties) {
      const keys = definition.properties.keys();
      for (const key of keys) {
        const identifier = definition.properties.getProperty(key);
        try {
          debug(
            'id = %s resolve property key = %s => %s.',
            definition.id,
            key,
            identifier
          );
          inst[key] = await this.resolveManagedAsync(identifier);
        } catch (error) {
          if (NotFoundError.isClosePrototypeOf(error)) {
            const className = definition.path.name;
            error.updateErrorMsg(className);
          }
          this.removeCreateStatus(definition, false);
          throw error;
        }
      }
    }

    for (const handler of this.afterCreateHandler) {
      handler.call(this, inst, this.context, definition);
    }

    // after properties set then do init
    await definition.creator.doInitAsync(inst);

    if (definition.isSingletonScope() && definition.id) {
      debug('id = %s set to singleton cache', definition.id);
      this.singletonCache.set(definition.id, inst);
    }

    // for request scope
    if (definition.isRequestScope() && definition.id) {
      debug('id = %s set to register object', definition.id);
      this.context.registerObject(definition.id, inst);
    }
    this.removeCreateStatus(definition, true);

    return inst;
  }

  async destroyCache(): Promise<void> {
    for (const key of this.singletonCache.keys()) {
      const definition = this.context.registry.getDefinition(key);
      if (definition.creator) {
        await definition.creator.doDestroyAsync(this.singletonCache.get(key));
      }
    }
    this.singletonCache.clear();
    this.creating.clear();
  }

  beforeEachCreated(
    fn: (Clzz: any, constructorArgs: [], context: IApplicationContext) => void
  ) {
    this.beforeCreateHandler.push(fn);
  }

  afterEachCreated(
    fn: (
      ins: any,
      context: IApplicationContext,
      definition?: IObjectDefinition
    ) => void
  ) {
    this.afterCreateHandler.push(fn);
  }
  /**
   * 触发单例初始化结束事件
   * @param definition 单例定义
   * @param success 成功 or 失败
   */
  private removeCreateStatus(
    definition: IObjectDefinition,
    success: boolean
  ): boolean {
    // 如果map中存在表示需要设置状态
    if (this.creating.has(definition.id)) {
      this.creating.set(definition.id, false);
    }
    return true;
  }

  public isCreating(definition: IObjectDefinition) {
    return this.creating.has(definition.id) && this.creating.get(definition.id);
  }

  private compareAndSetCreateStatus(definition: IObjectDefinition) {
    if (
      !this.creating.has(definition.id) ||
      !this.creating.get(definition.id)
    ) {
      this.creating.set(definition.id, true);
    }
  }
  /**
   * 创建对象定义的代理访问逻辑
   * @param definition 对象定义
   */
  private createProxyReference(definition: IObjectDefinition): any {
    if (this.isCreating(definition)) {
      debug('create proxy for %s.', definition.id);
      // 非循环依赖的允许重新创建对象
      if (!this.depthFirstSearch(definition.id, definition)) {
        debug('id = %s after dfs return null', definition.id);
        return null;
      }
      // 创建代理对象
      return new Proxy(
        { __is_proxy__: true, __target_id__: definition.id },
        {
          get: (obj, prop) => {
            let target;
            if (definition.isRequestScope()) {
              target = this.context.registry.getObject(definition.id);
            } else if (definition.isSingletonScope()) {
              target = this.singletonCache.get(definition.id);
            } else {
              target = this.context.get(definition.id);
            }

            if (target) {
              if (typeof target[prop] === 'function') {
                return target[prop].bind(target);
              }
              return target[prop];
            }

            return undefined;
          },
        }
      );
    }
    return null;
  }
  /**
   * 遍历依赖树判断是否循环依赖
   * @param identifier 目标id
   * @param definition 定义描述
   */
  public depthFirstSearch(
    identifier: string,
    definition: IObjectDefinition,
    depth?: string[]
  ): boolean {
    if (definition) {
      debug('dfs for %s == %s start.', identifier, definition.id);
      if (definition.constructorArgs) {
        const args = definition.constructorArgs.map(
          val => (val as ManagedReference).name
        );
        if (args.indexOf(identifier) > -1) {
          debug(
            'dfs exist in constructor %s == %s.',
            identifier,
            definition.id
          );
          return true;
        }
      }
      if (definition.properties) {
        const keys = definition.properties.keys();
        if (keys.indexOf(identifier) > -1) {
          debug('dfs exist in properties %s == %s.', identifier, definition.id);
          return true;
        }
        for (const key of keys) {
          if (!Array.isArray(depth)) {
            depth = [identifier];
          }
          let iden = key;
          const ref: ManagedReference = definition.properties.get(key);
          if (ref && ref.name) {
            iden = ref.name;
          }
          let subDefinition = this.context.registry.getDefinition(iden);
          if (!subDefinition && this.context.parent) {
            subDefinition = this.context.parent.registry.getDefinition(iden);
          }
          // find uuid
          if (!subDefinition && /:/.test(iden)) {
            iden = iden.replace(/^.*?:/, '');
            subDefinition = this.context.registry.getDefinition(iden);
            if (!subDefinition && this.context.parent) {
              subDefinition = this.context.parent.registry.getDefinition(iden);
            }
          }
          if (subDefinition) {
            iden = subDefinition.id;
          }
          if (iden === identifier) {
            debug(
              'dfs exist in properties key %s == %s.',
              identifier,
              definition.id
            );
            return true;
          }
          if (depth.indexOf(iden) > -1) {
            debug(
              'dfs depth circular %s == %s, %s, %j.',
              identifier,
              definition.id,
              iden,
              depth
            );
            continue;
          } else {
            depth.push(iden);
            debug('dfs depth push %s == %s, %j.', identifier, iden, depth);
          }
          if (this.depthFirstSearch(identifier, subDefinition, depth)) {
            debug(
              'dfs exist in sub tree %s == %s subId = %s.',
              identifier,
              definition.id,
              subDefinition.id
            );
            return true;
          }
        }
      }
      debug('dfs for %s == %s end.', identifier, definition.id);
    }
    return false;
  }
}
