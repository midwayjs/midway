import 'reflect-metadata';
import {Container, IContainer, TagClsMetadata, TAGGED_CLS} from 'midway-context';
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

const globby = require('globby');
const path = require('path');
const camelcase = require('camelcase');
const is = require('is-type-of');
const debug = require('debug')('midway:container');

export class MidwayContainer extends Container implements IContainer {

  configStore = {};
  pluginStore = {};
  loggerStore = {};

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
      let constructorMetaData = Reflect.getOwnMetadata(CLASS_KEY_CONSTRUCTOR, target);
      // lack of field
      if (constructorMetaData && constructorArgs) {
        for (let idx in constructorMetaData) {
          let index = parseInt(idx);
          const propertyMeta = constructorMetaData[index];
          let result;

          switch (propertyMeta.type) {
            case 'config':
              result = this.getConfig(propertyMeta.key);
              break;
            case 'logger':
              result = this.getLogger(propertyMeta.key);
              break;
            case 'plugin':
              result = this.getPlugin(propertyMeta.key);
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
      this.defineGetterPropertyValue(configSetterProps, CONFIG_KEY_PROP, instance, this.getConfig);

      // 处理插件装饰器
      const pluginSetterProps = this.getClzSetterProps(PLUGIN_KEY_CLZ, instance);
      this.defineGetterPropertyValue(pluginSetterProps, PLUGIN_KEY_PROP, instance, this.getPlugin);

      // 处理日志装饰器
      const loggerSetterProps = this.getClzSetterProps(LOGGER_KEY_CLZ, instance);
      this.defineGetterPropertyValue(loggerSetterProps, LOGGER_KEY_PROP, instance, this.getLogger);
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

  getConfig(configKey: string) {
    return this.configStore[configKey];
  }

  getPlugin(pluginName: string) {
    return this.pluginStore[pluginName];
  }

  getLogger(loggerName: string) {
    return this.loggerStore[loggerName];
  }
}
