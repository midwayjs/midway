import 'reflect-metadata';
import {
  Autowire,
  Container,
  IApplicationContext,
  IContainer,
  IManagedInstance,
  IManagedParser,
  IManagedResolver,
  IObjectDefinition,
  IObjectDefinitionParser,
  IParserContext,
  OBJ_DEF_CLS,
  ObjectDefinitionOptions,
  ObjectIdentifier,
  Scope,
  ScopeEnum,
  TagClsMetadata,
  TAGGED_CLS,
  XmlObjectDefinition
} from 'injection';
import {
  CLASS_KEY_CONSTRUCTOR,
  CONFIG_KEY_CLZ,
  CONFIG_KEY_PROP,
  FUNCTION_INJECT_KEY,
  LOGGER_KEY_CLZ,
  LOGGER_KEY_PROP,
  PLUGIN_KEY_CLZ,
  PLUGIN_KEY_PROP
} from './decorators';
import { MidwayHandlerKey } from './constants';

const globby = require('globby');
const path = require('path');
const camelcase = require('camelcase');
const is = require('is-type-of');
const debug = require('debug')('midway:container');
const CONTROLLERS = 'controllers';
const MIDDLEWARES = 'middlewares';
const TYPE_LOGGER = 'logger';
const TYPE_PLUGIN = 'plugin';

class BaseParser {
  container: MidwayContainer;

  constructor(container: MidwayContainer) {
    this.container = container;
  }
}

/**
 * 用于xml解析扩展
 * <controllers />
 */
class ControllerDefinitionParser extends BaseParser implements IObjectDefinitionParser {
  readonly name: string = CONTROLLERS;

  parse(ele: Element, context: IParserContext): IObjectDefinition {
    const definition = new XmlObjectDefinition(ele);

    context.parser.parseElementNodes(definition, ele, context);
    this.container.controllersIds.push(definition.id);
    return definition;
  }
}

/**
 * 用于xml解析扩展
 * <middlewares />
 */
class MiddlewareDefinitionParser extends BaseParser implements IObjectDefinitionParser {
  readonly name: string = MIDDLEWARES;

  parse(ele: Element, context: IParserContext): IObjectDefinition {
    const definition = new XmlObjectDefinition(ele);

    context.parser.parseElementNodes(definition, ele, context);
    this.container.middlewaresIds.push(definition.id);
    return definition;
  }
}

class ManagedLogger implements IManagedInstance {
  type = TYPE_LOGGER;
  name: string;
}

class LoggerParser implements IManagedParser {
  get name(): string {
    return TYPE_LOGGER;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const log = new ManagedLogger();
    log.name = ele.getAttribute('name').trim();
    return log;
  }
}

class LoggerResolver implements IManagedResolver {
  private container: MidwayContainer;

  constructor(container: MidwayContainer) {
    this.container = container;
  }

  get type(): string {
    return TYPE_LOGGER;
  }

  resolve(managed: IManagedInstance): any {
    const log: ManagedLogger = managed as ManagedLogger;
    if (log.name) {
      return this.container.handlerMap.get(MidwayHandlerKey.LOGGER)(log.name);
    }
    return this.container.handlerMap.get(MidwayHandlerKey.LOGGER)(log.type);
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    return this.resolve(managed);
  }
}

class ManagedPlugin implements IManagedInstance {
  type = TYPE_PLUGIN;
  name: string;
}

class PluginParser implements IManagedParser {
  get name(): string {
    return TYPE_PLUGIN;
  }

  parse(ele: Element, context: IParserContext): IManagedInstance {
    const plugin = new ManagedPlugin();
    plugin.name = ele.getAttribute('name').trim();
    return plugin;
  }
}

class PluginResolver implements IManagedResolver {
  private container: MidwayContainer;

  constructor(container: MidwayContainer) {
    this.container = container;
  }

  get type(): string {
    return TYPE_PLUGIN;
  }

  resolve(managed: IManagedInstance): any {
    const p = managed as ManagedPlugin;
    return this.container.handlerMap.get(MidwayHandlerKey.PLUGIN)(p.name);
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    return this.resolve(managed);
  }
}

export class MidwayContainer extends Container implements IContainer {
  controllersIds: string[] = [];
  middlewaresIds: string[] = [];
  handlerMap: Map<string, (handlerKey: string) => any>;
  // 仅仅用于兼容requestContainer的ctx
  ctx = {};

  init(): void {
    this.handlerMap = new Map();
    super.init();

    // xml扩展 <logger name=""/> <plugin name="hsfclient"/>
    this.parser.objectElementParser.registerParser(new LoggerParser());
    this.resolverFactory.registerResolver(new LoggerResolver(this));
    this.parser.objectElementParser.registerParser(new PluginParser());
    this.resolverFactory.registerResolver(new PluginResolver(this));

    this.parser.registerParser(new ControllerDefinitionParser(this));
    this.parser.registerParser(new MiddlewareDefinitionParser(this));

    this.registerEachCreatedHook();

    // 防止直接从applicationContext.getAsync or get对象实例时依赖当前上下文信息出错
    // ctx is in requestContainer
    this.registerObject('ctx', this.ctx);
  }
  /**
   * update current context in applicationContext
   * for mock and other case
   * @param ctx ctx
   */
  updateContext(ctx) {
    this.ctx = Object.assign({}, ctx || {});
  }

  /**
   * load directory and traverse file to find bind class
   * @param opts
   */
  load(opts: {
    loadDir: string | string[];
    pattern?: string[];
    ignore?: string[];
  }) {
    const loadDirs = [].concat(opts.loadDir || []);

    for (const dir of loadDirs) {
      const fileResults = globby.sync(['**/**.ts', '**/**.js', '!**/**.d.ts'].concat(opts.pattern || []), {
        cwd: dir,
        ignore: [
          '**/node_modules/**',
          '**/logs/**',
          '**/run/**',
          '**/public/**',
          '**/view/**',
          '**/views/**'
        ].concat(opts.ignore || []),
      });

      for (const name of fileResults) {
        const file = path.join(dir, name);
        debug(`binding file => ${file}`);
        const exports = require(file);

        if (is.class(exports) || is.function(exports)) {
          this.bindClass(exports);
        } else {
          for (const m in exports) {
            const module = exports[m];
            if (is.class(module) || is.function(module)) {
              this.bindClass(module);
            }
          }
        }
      }
    }
  }

  protected bindClass(module) {
    if (is.class(module)) {
      const metaData = Reflect.getMetadata(TAGGED_CLS, module) as TagClsMetadata;
      if (metaData) {
        this.bind(metaData.id, module);
      } else {
        // inject by name in js
        this.bind(camelcase(module.name), module);
      }
    } else {
      const info: {
        id: ObjectIdentifier,
        provider: (context?: IApplicationContext) => any,
        scope?: Scope,
        isAutowire?: boolean
      } = module[FUNCTION_INJECT_KEY];
      if (info && info.id) {
        if (!info.scope) {
          info.scope = ScopeEnum.Request;
        }
        this.bind(info.id, module, {
          scope: info.scope,
          isAutowire: info.isAutowire
        });
      }
    }
  }

  createChild(): IContainer {
    const child = new Container();
    child.parent = this;
    return child;
  }

  protected registerEachCreatedHook() {
    // register constructor inject
    this.beforeEachCreated((target, constructorArgs, context) => {
      let constructorMetaData;
      try {
        constructorMetaData = Reflect.getOwnMetadata(CLASS_KEY_CONSTRUCTOR, target);
      } catch (e) {
        debug(`beforeEachCreated error ${e.stack}`);
      }
      // lack of field
      if (constructorMetaData && constructorArgs) {
        for (const idx in constructorMetaData) {
          const index = parseInt(idx, 10);
          const propertyMeta = constructorMetaData[index];
          let result;

          switch (propertyMeta.type) {
            case 'config':
              result = this.handlerMap.get(MidwayHandlerKey.CONFIG)(propertyMeta.key);
              break;
            case 'logger':
              result = this.handlerMap.get(MidwayHandlerKey.LOGGER)(propertyMeta.key);
              break;
            case 'plugin':
              result = this.handlerMap.get(MidwayHandlerKey.PLUGIN)(propertyMeta.key);
              break;
          }
          constructorArgs[index] = result;
        }
      }
    });

    // register property inject
    this.afterEachCreated((instance, context, definition) => {

      // 处理配置装饰器
      const configSetterProps = this.getClzSetterProps(CONFIG_KEY_CLZ, instance);
      this.defineGetterPropertyValue(configSetterProps, CONFIG_KEY_PROP, instance, this.handlerMap.get(MidwayHandlerKey.CONFIG));
      // 处理插件装饰器
      const pluginSetterProps = this.getClzSetterProps(PLUGIN_KEY_CLZ, instance);
      this.defineGetterPropertyValue(pluginSetterProps, PLUGIN_KEY_PROP, instance, this.handlerMap.get(MidwayHandlerKey.PLUGIN));
      // 处理日志装饰器
      const loggerSetterProps = this.getClzSetterProps(LOGGER_KEY_CLZ, instance);
      this.defineGetterPropertyValue(loggerSetterProps, LOGGER_KEY_PROP, instance, this.handlerMap.get(MidwayHandlerKey.LOGGER));

      // 表示非ts annotation模式
      if (!pluginSetterProps && !loggerSetterProps && definition.isAutowire()) {
        // this.$$xxx = null; 用来注入config
        // this.$xxx = null; 用来注入 logger 或者 插件
        Autowire.patchDollar(instance, context, (key: string) => {
          if (key[0] === '$') {
            return this.handlerMap.get(MidwayHandlerKey.CONFIG)(key.slice(1));
          }
          try {
            const v = this.handlerMap.get(MidwayHandlerKey.PLUGIN)(key);
            if (v) {
              return v;
            }
          } catch (e) {
          }
          return this.handlerMap.get(MidwayHandlerKey.LOGGER)(key);
        });
      }
    });
  }

  /**
   * get method name for decorator
   *
   * @param setterClzKey
   * @param target
   * @returns {Array<string>}
   */
  private getClzSetterProps(setterClzKey, target): string[] {
    return Reflect.getMetadata(setterClzKey, target);
  }

  /**
   * binding getter method for decorator
   *
   * @param setterProps
   * @param metadataKey
   * @param instance
   * @param getterHandler
   */
  private defineGetterPropertyValue(setterProps, metadataKey, instance, getterHandler) {
    if (setterProps && getterHandler) {
      for (const prop of setterProps) {
        const propertyKey = Reflect.getMetadata(metadataKey, instance, prop);
        if (propertyKey) {
          Object.defineProperty(instance, prop, {
            get: () => getterHandler(propertyKey),
            configurable: false,
            enumerable: true
          });
        }
      }
    }
  }

  registerDataHandler(handlerType: string, handler: (handlerKey) => any) {
    this.handlerMap.set(handlerType, handler);
  }

  registerCustomBinding(objectDefinition, target) {
    super.registerCustomBinding(objectDefinition, target);

    // Override the default scope to request
    const objDefOptions: ObjectDefinitionOptions = Reflect.getMetadata(OBJ_DEF_CLS, target);
    if (objDefOptions && !objDefOptions.scope) {
      debug(`register @scope to default value(request), id=${objectDefinition.id}`);
      objectDefinition.scope = ScopeEnum.Request;
    }
  }

}
