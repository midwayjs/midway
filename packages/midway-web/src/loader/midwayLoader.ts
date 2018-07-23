import {Router} from '../router';
import {isTypeScriptEnvironment} from '../utils';
import * as path from 'path';
import * as fs from 'fs';
import {MidwayContainer} from '../midwayContainer';
import {Container, TagClsMetadata, TAGGED_CLS} from 'midway-context';
import {loading} from '../loading';
import 'reflect-metadata';
import {
  CLASS_KEY_CONSTRUCTOR,
  CONFIG_KEY_CLZ,
  CONFIG_KEY_PROP,
  LOGGER_KEY_CLZ,
  LOGGER_KEY_PROP,
  PLUGIN_KEY_CLZ,
  PLUGIN_KEY_PROP,
  WEB_ROUTER_CLS,
  WEB_ROUTER_PREFIX_CLS,
  WEB_ROUTER_PROP
} from '../decorators/metaKeys';

const EggLoader = require('egg-core').EggLoader;
const TS_SRC_DIR = 'src';
const TS_TARGET_DIR = 'dist';
const is = require('is-type-of');
const debug = require('debug')('midway:loader');


export class MidwayLoader extends EggLoader {

  protected pluginLoaded = false;
  applicationContext;
  pluginContext;
  baseDir;
  appDir;
  options;
  dirs;
  appInfo;

  constructor(options: { baseDir?, typescript?, srcDir?, targetDir? } = {}) {
    super(options);

    this.pluginContext = new Container();
    this.applicationContext = new MidwayContainer();
    this.applicationContext.load({
      loadDir: this.options.baseDir,
    });
  }

  // loadPlugin -> loadAntx -> loadConfig -> afterLoadConfig
  loadConfig() {
    this.loadPlugin();
    super.loadConfig();
  }

  async preloadController(): Promise<void> {
    const appDir = path.join(this.options.baseDir, 'app');
    const results = loading(this.getFileExtension(['controllers/**/*', 'controller/**/*']), {
      loadDirs: appDir,
      call: false,
    });

    for (let exports of results) {
      if (is.class(exports)) {
        await this.preInitController(exports);
      } else {
        for (let m in exports) {
          const module = exports[m];
          if (is.class(module)) {
            await this.preInitController(module);
          }
        }
      }
    }
  }

  /**
   * init controller in ApplicationContext
   * @param module
   */
  private async preInitController(module): Promise<void> {
    let cid = this.getModuleIdentifier(module);
    if (cid) {
      const controller = await this.applicationContext.getAsync(cid);
      this.preRegisterRouter(module, controller);
    }
  }

  private getModuleIdentifier(module) {
    let metaData = <TagClsMetadata>Reflect.getMetadata(TAGGED_CLS, module);
    if (metaData) {
      return metaData.id;
    }
  }

  private preRegisterRouter(target, controller) {
    const app = this.app;
    const controllerPrefix = Reflect.getMetadata(WEB_ROUTER_PREFIX_CLS, target);
    if (controllerPrefix) {
      let newRouter = new Router({
        sensitive: true,
        logger: this.options.logger,
      }, app);
      newRouter.prefix(controllerPrefix);
      const methodNames = Reflect.getMetadata(WEB_ROUTER_CLS, target);
      for (let methodName of methodNames) {
        const mappingInfo = Reflect.getMetadata(WEB_ROUTER_PROP, target, methodName);
        newRouter[mappingInfo.requestMethod].call(newRouter, mappingInfo.routerName, mappingInfo.path, controller[methodName].bind(controller));
      }
      app.use(newRouter.middleware());
    }
  }

  async refreshContext(): Promise<void> {

    // register constructor inject
    this.applicationContext.beforeEachCreated((target, constructorArgs, context) => {
      let constructorMetaData = Reflect.getOwnMetadata(CLASS_KEY_CONSTRUCTOR, target);
      // lack of field
      if (constructorMetaData && constructorArgs) {
        for (let idx in constructorMetaData) {
          let index = parseInt(idx);
          const propertyMeta = constructorMetaData[index];
          let result;

          switch (propertyMeta.type) {
            case 'config':
              result = this.config[propertyMeta.key];
              break;
            case 'logger':
              result = this.app.getLogger(propertyMeta.key);
              break;
            case 'plugin':
              result = this.pluginContext.get(propertyMeta.key);
              break;
          }
          constructorArgs[index] = result;
        }
      }
    });

    // register property inject
    this.applicationContext.afterEachCreated((instance, context) => {

      // 处理配置装饰器
      const configSetterProps = this.getClzSetterProps(CONFIG_KEY_CLZ, instance);
      this.defineGetterPropertyValue(configSetterProps, CONFIG_KEY_PROP, instance, (configKey) => {
        return this.config[configKey];
      });

      // 处理插件装饰器
      const pluginSetterProps = this.getClzSetterProps(PLUGIN_KEY_CLZ, instance);
      this.defineGetterPropertyValue(pluginSetterProps, PLUGIN_KEY_PROP, instance, (pluginName) => {
        return this.pluginContext.get(pluginName);
      });

      // 处理日志装饰器
      const loggerSetterProps = this.getClzSetterProps(LOGGER_KEY_CLZ, instance);
      this.defineGetterPropertyValue(loggerSetterProps, LOGGER_KEY_PROP, instance, (loggerName) => {
        return this.app.getLogger(loggerName);
      });
    });

    await this.pluginContext.ready();
    await this.applicationContext.ready();
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

  // Get the real plugin path
  getPluginPath(plugin) {
    if (plugin.path) {
      return plugin.path;
    }

    const name = plugin.package || plugin.name;
    let lookupDirs = [];

    // 尝试在以下目录找到匹配的插件
    //  -> {APP_PATH}/node_modules
    //    -> {EGG_PATH}/node_modules
    //      -> $CWD/node_modules
    lookupDirs.push(path.join(this.appDir, 'node_modules'));

    // 到 egg 中查找，优先从外往里查找
    for (let i = this.eggPaths.length - 1; i >= 0; i--) {
      const eggPath = this.eggPaths[i];
      lookupDirs.push(path.join(eggPath, 'node_modules'));
    }

    // should find the $cwd/node_modules when test the plugins under npm3
    lookupDirs.push(path.join(process.cwd(), 'node_modules'));

    if (process.env.PLUGIN_PATH) {
      lookupDirs.push(path.join(process.env.PLUGIN_PATH, 'node_modules'));
    }

    for (let dir of lookupDirs) {
      dir = path.join(dir, name);
      if (fs.existsSync(dir)) {
        return fs.realpathSync(dir);
      }
    }

    throw new Error(`Can not find plugin ${name} in "${lookupDirs.join(', ')}"`);
  }

  getFileExtension(names: string | string[]): string[] {
    if (typeof names === 'string') {
      return [names + '.ts', names + '.js', '!**/**.d.ts'];
    } else {
      let arr = [];
      names.forEach((name) => {
        arr = arr.concat([name + '.ts', name + '.js']);
      });
      return arr.concat(['!**/**.d.ts']);
    }
  }

  protected registerTypescriptDirectory() {
    const app = this.app;
    // 处理 ts 的初始路径
    this.appDir = this.baseDir = app.options.baseDir;
    if (this.app.options.typescript) {
      let dirSuffix = app.options.targetDir || TS_TARGET_DIR;
      if (isTypeScriptEnvironment()) {
        dirSuffix = app.options.srcDir || TS_SRC_DIR;
        // 打开 egg 加载 ts 的开关
        process.env.EGG_TYPESCRIPT = 'true';
        debug(`typescript mode = true`);
      }

      const dir = path.join(app.options.baseDir, dirSuffix);
      this.baseDir = app.options.baseDir = this.options.baseDir = dir;
      this.options.logger.info(`in typescript current dir change to ${dir}`);
      debug(`in typescript current dir change to ${dir}`);
    }
  }

  getAppInfo() {
    if(!this.appInfo) {
      this.registerTypescriptDirectory();
      const appInfo = super.getAppInfo();
      this.appInfo = Object.assign(appInfo, {
        root: this.appDir
      });
    }
    return this.appInfo;
  }

}