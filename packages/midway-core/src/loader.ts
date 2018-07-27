import {isPluginName, isTypeScriptEnvironment} from './utils';
import * as path from 'path';
import * as fs from 'fs';
import {MidwayContainer} from './container';
import {MidwayHandlerKey} from './constants';
import {MidwayLoaderOptions} from './interface';

const EggLoader = require('egg-core').EggLoader;
const TS_SRC_DIR = 'src';
const TS_TARGET_DIR = 'dist';
const debug = require('debug')('midway:loader');

export class MidwayLoader extends EggLoader {

  protected pluginLoaded = false;
  applicationContext;
  pluginContext;
  baseDir;
  appDir;
  options;
  appInfo;

  constructor(options: MidwayLoaderOptions) {
    super(options);
    this.pluginContext = new MidwayContainer();
  }

  // loadPlugin -> loadConfig -> afterLoadConfig
  loadConfig() {
    this.loadPlugin();
    super.loadConfig();
  }

  async refreshContext(): Promise<void> {
    await this.pluginContext.ready();
    await this.applicationContext.ready();
  }

  // Get the real plugin path
  protected getPluginPath(plugin) {
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

  private registerTypescriptDirectory() {
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
    if (!this.appInfo) {
      this.registerTypescriptDirectory();
      const appInfo = super.getAppInfo();
      this.appInfo = Object.assign(appInfo, {
        root: this.appDir
      });
    }
    return this.appInfo;
  }

  protected loadApplicationContext() {
    // const containerConfig = this.config['container'];
    this.applicationContext = new MidwayContainer();
    this.applicationContext.load({
      loadDir: this.options.baseDir,
    });

    // register handler for container
    this.applicationContext.registerDataHandler(MidwayHandlerKey.CONFIG, (key) => {
      return this.config[key];
    });

    this.applicationContext.registerDataHandler(MidwayHandlerKey.PLUGIN, (key) => {
      return this.pluginContext.get(key);
    });

    this.applicationContext.registerDataHandler(MidwayHandlerKey.LOGGER, (key) => {
      return this.app.getLogger(key);
    });
  }

  /**
   * intercept plugin when it set value to app
   * @param fileName
   * @returns {boolean}
   */
  protected interceptLoadCustomApplication(fileName) {
    const self = this;
    const pluginContainerProps = Object.getOwnPropertyNames(this);
    this.app = new Proxy(this.app, {
      set(obj, prop, value) {
        if (!self.pluginLoaded && isPluginName(prop) && !(prop in pluginContainerProps)) {
          // save to context when called app.xxx = xxx
          // now we can get plugin from context
          self.pluginContext.registerObject(prop, value);
        }
        return Reflect.set(obj, prop, value);
      }
    });

    this.getLoadUnits()
      .forEach(unit => {
        // 兼容旧插件加载方式
        let ret = this.loadFile(this.resolveModule(path.join(unit.path, fileName)));
        if (ret) {
          // midway 的插件会返回对象
          this.pluginContext.registerObject(unit.name, ret);
        }
      });

    // 插件加载完毕
    this.pluginLoaded = true;
  }

}
