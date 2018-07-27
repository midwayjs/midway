import 'reflect-metadata';
import {Container,
  IContainer,
  TagClsMetadata, TAGGED_CLS,
  IObjectDefinitionParser,
  IParserContext,
  IObjectDefinition,
  XmlObjectDefinition,
  Autowire} from 'injection';
import {
  CLASS_KEY_CONSTRUCTOR,
  CONFIG_KEY_CLZ,
  CONFIG_KEY_PROP,
  FUNCTION_INJECT_KEY,
  LOGGER_KEY_CLZ,
  LOGGER_KEY_PROP,
  PLUGIN_KEY_CLZ,
  PLUGIN_KEY_PROP
} from './decorators/metaKeys';
import {MidwayHandlerKey} from './constants';

const globby = require('globby');
const path = require('path');
const camelcase = require('camelcase');
const is = require('is-type-of');
const debug = require('debug')('midway:container');
const CONTROLLERS = 'controllers';
const MIDDLEWARES = 'middlewares';

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

export class MidwayContainer extends Container implements IContainer {
  controllersIds: Array<string> = [];
  middlewaresIds: Array<string> = [];

  handlerMap: Map<string, (handlerKey: string) => any> = new Map();

  init(): void {
    super.init();

    this.parser.registerParser(new ControllerDefinitionParser(this));
    this.parser.registerParser(new MiddlewareDefinitionParser(this));
  }


  /**
   * load directory and traverse file to find bind class
   * @param {{loadDir: string | string[]; pattern?: string[]; ignore?: string[]}} opts
   */
  load(opts: {
    loadDir: string | string[];
    pattern?: string[];
    ignore?: string[];
  }) {
    const loadDirs = [].concat(opts.loadDir);

    for (let dir of loadDirs) {
      let fileResults = globby.sync(['**/**.ts', '**/**.js', '!**/**.d.ts'].concat(opts.pattern || []), {
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

      for (let name of fileResults) {
        const file = path.join(dir, name);
        debug(`binding file => ${file}`);
        let exports = require(file);

        if (is.class(exports) || is.function(exports)) {
          this.bindClass(exports);
        } else {
          for (let m in exports) {
            const module = exports[m];
            if (is.class(module) || is.function(module)) {
              this.bindClass(module);
            }
          }
        }
      }
    }
  }

  private bindClass(module) {
    if (is.class(module)) {
      let metaData = <TagClsMetadata>Reflect.getMetadata(TAGGED_CLS, module);
      if (metaData) {
        this.bind(metaData.id, module);
      } else {
        // inject by name in js
        this.bind(camelcase(module.name), module);
      }
    } else {
      let id = module[FUNCTION_INJECT_KEY];
      if (id) {
        this.bind(id, module);
      }
    }
  }

  createChild(): IContainer {
    const child = new Container();
    child.parent = this;
    return child;
  }

  async ready() {
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
        for (let idx in constructorMetaData) {
          let index = parseInt(idx, 10);
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
    this.afterEachCreated((instance, context) => {

      // 处理配置装饰器
      const configSetterProps = this.getClzSetterProps(CONFIG_KEY_CLZ, instance);
      this.defineGetterPropertyValue(configSetterProps, CONFIG_KEY_PROP, instance, this.handlerMap.get(MidwayHandlerKey.CONFIG));

      // 处理插件装饰器
      const pluginSetterProps = this.getClzSetterProps(PLUGIN_KEY_CLZ, instance);
      this.defineGetterPropertyValue(pluginSetterProps, PLUGIN_KEY_PROP, instance, this.handlerMap.get(MidwayHandlerKey.PLUGIN));
      // 表示非ts annotation模式
      if (!pluginSetterProps) {
        Autowire.patchDollar(instance, context, this.handlerMap.get(MidwayHandlerKey.PLUGIN));
      }
      // 处理日志装饰器
      const loggerSetterProps = this.getClzSetterProps(LOGGER_KEY_CLZ, instance);
      this.defineGetterPropertyValue(loggerSetterProps, LOGGER_KEY_PROP, instance, this.handlerMap.get(MidwayHandlerKey.LOGGER));
    });

    await super.ready();
  }

  /**
   * get method name for decorator
   *
   * @param setterClzKey
   * @param target
   * @returns {Array<string>}
   */
  private getClzSetterProps(setterClzKey, target): Array<string> {
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
    if (setterProps) {
      for (let prop of setterProps) {
        let propertyKey = Reflect.getMetadata(metadataKey, instance, prop);
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

}
