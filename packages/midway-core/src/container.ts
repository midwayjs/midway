import * as path from 'path';

import { CLASS_KEY_CONSTRUCTOR, CONFIG_KEY, LOGGER_KEY, PLUGIN_KEY } from '@midwayjs/decorator';
import * as globby from 'globby';
import {
  Autowire,
  Container,
  getClassMetadata,
  getObjectDefinition,
  getProviderId,
  IApplicationContext,
  IContainer,
  IManagedInstance,
  IManagedParser,
  IManagedResolver,
  IObjectDefinition,
  IObjectDefinitionParser,
  IParserContext,
  ObjectDefinitionOptions,
  ObjectIdentifier,
  Scope,
  ScopeEnum,
  XmlObjectDefinition,
} from 'injection';
import * as is from 'is-type-of';
import * as graphviz from 'graphviz';
import * as camelcase from 'camelcase';
import * as Debug from 'debug';

import { FUNCTION_INJECT_KEY, MidwayHandlerKey } from './constant';


const debug = Debug('midway:container');

const CONTROLLERS = 'controllers';
const MIDDLEWARES = 'middlewares';
const TYPE_LOGGER = 'logger';
const TYPE_PLUGIN = 'plugin';

interface FrameworkDecoratorMetadata {
  key: string
  propertyName: string
}

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
      return this.container.findHandlerHook(MidwayHandlerKey.LOGGER)(log.name);
    }
    return this.container.findHandlerHook(MidwayHandlerKey.LOGGER)(log.type);
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
    return this.container.findHandlerHook(MidwayHandlerKey.PLUGIN)(p.name);
  }

  async resolveAsync(managed: IManagedInstance): Promise<any> {
    return this.resolve(managed);
  }
}

export class MidwayContainer extends Container implements IContainer {
  controllersIds: string[] = [];
  middlewaresIds: string[] = [];
  handlerMap: Map<string, (handlerKey: string, instance?: any) => any>;
  // 仅仅用于兼容requestContainer的ctx
  ctx = {};
  isTsMode;

  constructor(baseDir: string = process.cwd(), parent: IApplicationContext = undefined, isTsMode = true) {
    super(baseDir, parent);
    this.isTsMode = isTsMode;
  }

  init(): void {
    this.handlerMap = new Map();
    super.init();

    if (! this.isTsMode) {
      // xml扩展 <logger name=""/> <plugin name="hsfclient"/>
      this.parser.objectElementParser.registerParser(new LoggerParser());
      this.getManagedResolverFactory().registerResolver(new LoggerResolver(this));
      this.parser.objectElementParser.registerParser(new PluginParser());
      this.getManagedResolverFactory().registerResolver(new PluginResolver(this));

      this.parser.registerParser(new ControllerDefinitionParser(this));
      this.parser.registerParser(new MiddlewareDefinitionParser(this));
    }

    this.registerEachCreatedHook();

    // 防止直接从applicationContext.getAsync or get对象实例时依赖当前上下文信息出错
    // ctx is in requestContainer
    this.registerObject('ctx', this.ctx);
  }

  /**
   * update current context in applicationContext
   * for mock and other case
   * @param ctx ctx
   * @deprecated
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
    pattern?: string | string[];
    ignore?: string | string[];
  }) {
    const loadDirs = [].concat(opts.loadDir || []);

    // TODO set 去重
    for (const dir of loadDirs) {
      const fileResults = globby.sync(['**/**.ts', '**/**.tsx', '**/**.js', '!**/**.d.ts'].concat(opts.pattern || []), {
        cwd: dir,
        followSymbolicLinks: false,
        ignore: [
          '**/node_modules/**',
          '**/logs/**',
          '**/run/**',
          '**/public/**',
          '**/view/**',
          '**/views/**',
        ].concat(opts.ignore || []),
      });

      for (const name of fileResults) {
        const file = path.join(dir, name);
        debug(`binding file => ${file}`);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const exports = require(file);
        this.bindClass(exports);
      }
    }
  }

  bindClass(exports) {
    if (is.class(exports) || is.function(exports)) {
      this.bindModule(exports);
    }
    else {
      for (const m in exports) {
        const module = exports[m];
        if (is.class(module) || is.function(module)) {
          this.bindModule(module);
        }
      }
    }
  }

  protected bindModule(module) {
    if (is.class(module)) {
      const providerId = getProviderId(module);
      if (providerId) {
        this.bind(providerId, module);
      }
      else {
        if (! this.isTsMode) {
          // inject by name in js
          this.bind(camelcase(module.name), module);
        }
      }
    }
    else {
      const info: {
        id: ObjectIdentifier;
        provider: (context?: IApplicationContext) => any;
        scope?: Scope;
        isAutowire?: boolean;
      } = module[FUNCTION_INJECT_KEY];
      if (info && info.id) {
        if (! info.scope) {
          info.scope = ScopeEnum.Request;
        }
        this.bind(info.id, module, {
          scope: info.scope,
          isAutowire: info.isAutowire,
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
        constructorMetaData = getClassMetadata(CLASS_KEY_CONSTRUCTOR, target);
      }
      catch (e) {
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
              result = this.findHandlerHook(MidwayHandlerKey.CONFIG)(propertyMeta.key);
              break;
            case 'logger':
              result = this.findHandlerHook(MidwayHandlerKey.LOGGER)(propertyMeta.key);
              break;
            case 'plugin':
              result = this.findHandlerHook(MidwayHandlerKey.PLUGIN)(propertyMeta.key);
              break;
          }
          constructorArgs[index] = result;
        }
      }
    });

    // register property inject
    this.afterEachCreated((instance, context, definition) => {

      // 处理配置装饰器
      const configSetterProps: FrameworkDecoratorMetadata[] = getClassMetadata(CONFIG_KEY, instance);
      this.defineGetterPropertyValue(configSetterProps, instance, this.findHandlerHook(MidwayHandlerKey.CONFIG));
      // 处理插件装饰器
      const pluginSetterProps: FrameworkDecoratorMetadata[] = getClassMetadata(PLUGIN_KEY, instance);
      this.defineGetterPropertyValue(pluginSetterProps, instance, this.findHandlerHook(MidwayHandlerKey.PLUGIN));
      // 处理日志装饰器
      const loggerSetterProps: FrameworkDecoratorMetadata[] = getClassMetadata(LOGGER_KEY, instance);
      this.defineGetterPropertyValue(loggerSetterProps, instance, this.findHandlerHook(MidwayHandlerKey.LOGGER));

      // 表示非ts annotation模式
      if (! this.isTsMode && ! pluginSetterProps && ! loggerSetterProps && definition.isAutowire()) {
        // this.$$xxx = null; 用来注入config
        // this.$xxx = null; 用来注入 logger 或者 插件
        Autowire.patchDollar(instance, context, (key: string) => {
          if (key[0] === '$') {
            return this.findHandlerHook(MidwayHandlerKey.CONFIG)(key.slice(1));
          }
          try {
            const v = this.findHandlerHook(MidwayHandlerKey.PLUGIN)(key);
            if (v) {
              return v;
            }
          }
          catch (e) {
            // void
          }
          return this.findHandlerHook(MidwayHandlerKey.LOGGER)(key);
        });
      }
    });
  }

  /**
   * binding getter method for decorator
   *
   * @param setterProps
   * @param instance
   * @param getterHandler
   */
  private defineGetterPropertyValue(setterProps: FrameworkDecoratorMetadata[], instance, getterHandler) {
    if (setterProps && getterHandler) {
      for (const prop of setterProps) {
        if (prop.propertyName) {
          Object.defineProperty(instance, prop.propertyName, {
            get: () => getterHandler(prop.key, instance),
            configurable: false,
            enumerable: true,
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
    const objDefOptions: ObjectDefinitionOptions = getObjectDefinition(target);
    if (objDefOptions && ! objDefOptions.scope) {
      debug(`register @scope to default value(request), id=${objectDefinition.id}`);
      objectDefinition.scope = ScopeEnum.Request;
    }
  }

  dumpDependency() {
    const g = graphviz.digraph('G');

    for (const [id, module] of this.dependencyMap.entries()) {
      g.addNode(id, { label: `${id}(${module.name})\nscope:${module.scope}`, fontsize: '10' });
      module.properties.forEach((depId) => {
        g.addEdge(id, depId, { label: 'properties', fontsize: '8' });
      });
      module.constructorArgs.forEach((depId) => {
        g.addEdge(id, depId, { label: 'constructor', fontsize: '8' });
      });
    }

    try {
      return g.to_dot();
    }
    catch (err) {
      console.error('generate injection dependency tree fail, err = ', err.message);
    }
  }

  /**
   * get hook from current map or parent map
   * @param hookKey
   */
  findHandlerHook(hookKey: string) {
    if (this.handlerMap.has(hookKey)) {
      return this.handlerMap.get(hookKey);
    }

    if (this.parent) {
      return (this.parent as MidwayContainer).findHandlerHook(hookKey);
    }
  }

}
