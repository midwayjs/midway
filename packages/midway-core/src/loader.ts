import { isPluginName, isTypeScriptEnvironment } from './utils';
import * as path from 'path';
import * as fs from 'fs';
import { MidwayContainer } from './container';
import { MidwayHandlerKey } from './constants';
import { MidwayLoaderOptions } from './interface';
import { MidwayRequestContainer } from './requestContainer';
import * as extend from 'extend2';

const EggLoader = require('egg-core').EggLoader;
const TS_SRC_DIR = 'src';
const TS_TARGET_DIR = 'dist';
const debug = require('debug')(`midway:loader:${process.pid}`);

export class MidwayLoader extends EggLoader {

  protected pluginLoaded = false;
  applicationContext;
  pluginContext;
  baseDir;
  appDir;
  options;

  constructor(options: MidwayLoaderOptions) {
    super(options);
    this.pluginContext = new MidwayContainer();
  }

  /**
   * 判断是否是 ts 模式，在构造器内就会被执行
   */
  get isTsMode() {
    return this.app.options.typescript;
  }

  // loadPlugin -> loadConfig -> afterLoadConfig
  loadConfig() {
    this.loadPlugin();
    super.loadConfig();
  }

  async refreshContext(): Promise<void> {
    // 虽然有点hack，但是将就着用吧
    if (Array.isArray(this.config.configLocations)) {
      this.applicationContext.configLocations = this.config.configLocations;
      this.applicationContext.props.putObject(this.config);
    }

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
    if (this.isTsMode) {
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

  getEggPaths() {
    if (!this.appDir) {
      // register appDir here
      this.registerTypescriptDirectory();
    }
    return super.getEggPaths();
  }

  getServerEnv() {
    let serverEnv;

    const envPath = path.join(this.appDir, 'config/env');
    if (fs.existsSync(envPath)) {
      serverEnv = fs.readFileSync(envPath, 'utf8').trim();
    }

    if (!serverEnv) {
      serverEnv = process.env.EGG_SERVER_ENV || process.env.MIDWAY_SERVER_ENV;
    }

    if (!serverEnv) {
      serverEnv = super.getServerEnv();
    }

    return serverEnv;
  }

  private buildLoadDir(dir) {
    if (!path.isAbsolute(dir)) {
      return path.join(this.appDir, dir);
    }
    return dir;
  }

  protected loadApplicationContext() {
    // this.app.options.container 测试用例编写方便点
    let containerConfig = this.config.container || this.app.options.container || {};
    // 在 super contructor 中会调用到getAppInfo，之后会被赋值
    // 如果是typescript会加上 dist 或者 src 目录
    this.applicationContext = new MidwayContainer(this.baseDir);
    const requestContext = new MidwayRequestContainer(this.applicationContext);
    // put requestContext to applicationContext
    this.applicationContext.registerObject('requestContext', requestContext);
    this.applicationContext.registerObject('baseDir', this.baseDir);
    this.applicationContext.registerObject('appDir', this.appDir);
    this.applicationContext.registerObject('isTsMode', this.isTsMode);
    // 如果没有关闭autoLoad 则进行load
    if (!containerConfig.disableAutoLoad) {
      const defaultLoadDir = this.isTsMode ? [this.baseDir] : ['app', 'lib'];
      this.applicationContext.load({
        loadDir: (containerConfig.loadDir || defaultLoadDir).map(dir => {
          return this.buildLoadDir(dir);
        }),
        pattern: containerConfig.pattern,
        ignore: containerConfig.ignore
      });
    }

    // register handler for container
    this.applicationContext.registerDataHandler(MidwayHandlerKey.CONFIG, (key) => {
      return this.config[key];
    });

    this.applicationContext.registerDataHandler(MidwayHandlerKey.PLUGIN, (key) => {
      return this.pluginContext.get(key);
    });

    this.applicationContext.registerDataHandler(MidwayHandlerKey.LOGGER, (key) => {
      if (this.app.getLogger) {
        return this.app.getLogger(key);
      }
      return this.options.logger;
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
      defineProperty(target, prop, attributes) {
        if (!self.pluginLoaded && isPluginName(prop) && !(prop in pluginContainerProps)) {
          // save to context when called app.xxx = xxx
          // now we can get plugin from context
          debug(`pluginContext register [${<string>prop}]`);
          self.pluginContext.registerObject(prop, attributes.value);
        }
        return Object.defineProperty(target, prop, attributes);
      }
    });

    this.getLoadUnits()
      .forEach(unit => {
        // 兼容旧插件加载方式
        let ret = this.loadFile(this.resolveModule(path.join(unit.path, fileName)));
        if (ret) {
          // midway 的插件会返回对象
          debug(`pluginContext register [${unit.name}]`);
          this.pluginContext.registerObject(unit.name, ret);
        }
      });

    // 插件加载完毕
    this.pluginLoaded = true;
  }

  getAppInfo() {
    if (!this.appInfo) {
      const appInfo = super.getAppInfo();
      // ROOT == HOME in prod env
      this.appInfo = extend(true, appInfo, {
        root: appInfo.env === 'local' || appInfo.env === 'unittest' ? this.appDir : appInfo.root,
        appDir: this.appDir,
      });
    }
    return this.appInfo;
  }
}
