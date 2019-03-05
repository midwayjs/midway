import { EggRouter as Router } from '@eggjs/router';
import {
  CONTROLLER_KEY,
  ControllerOption,
  PRIORITY_KEY,
  RouterOption,
  WEB_ROUTER_KEY,
  WebMiddleware
} from '@midwayjs/decorator';
import * as extend from 'extend2';
import * as fs from 'fs';
import { getClassMetadata, getProviderId, listModule } from 'injection';
import { ContainerLoader, MidwayHandlerKey } from 'midway-core';
import * as path from 'path';
import { MidwayLoaderOptions } from '../interface';
import { isPluginName, isTypeScriptEnvironment } from '../utils';

const debug = require('debug')(`midway:loader:${process.pid}`);
const EggLoader = require('egg-core').EggLoader;

const TS_SRC_DIR = 'src';
const TS_TARGET_DIR = 'dist';

export class MidwayWebLoader extends EggLoader {
  private controllerIds: string[] = [];
  private prioritySortRouters: Array<{
    priority: number,
    router: Router,
  }> = [];
  private containerLoader;

  constructor(options: MidwayLoaderOptions) {
    super(options);
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

  protected async loadMidwayController(): Promise<void> {
    const controllerModules = listModule(CONTROLLER_KEY);

    // implement @controller
    for (const module of controllerModules) {
      const providerId = getProviderId(module);
      if (providerId) {
        if (this.controllerIds.indexOf(providerId) > -1) {
          throw new Error(`controller identifier [${providerId}] is exists!`);
        }
        this.controllerIds.push(providerId);
        await this.preRegisterRouter(module, providerId);
      }
    }

    // implement @priority
    if (this.prioritySortRouters.length) {
      this.prioritySortRouters = this.prioritySortRouters.sort((routerA, routerB) => {
        return routerB.priority - routerA.priority;
      });

      this.prioritySortRouters.forEach((prioritySortRouter) => {
        this.app.use(prioritySortRouter.router.middleware());
      });
    }
  }

  /**
   * 从xml加载controller
   */
  protected async preloadControllerFromXml(): Promise<void> {
    const ids = this.applicationContext.controllersIds;
    if (Array.isArray(ids) && ids.length > 0) {
      for (const id of ids) {
        const controllers = await this.applicationContext.getAsync(id);
        const app = this.app;
        if (Array.isArray(controllers.list)) {
          controllers.list.forEach(c => {
            const newRouter = new Router({
              sensitive: true,
            }, app);
            c.expose(newRouter);

            app.use(newRouter.middleware());
          });
        }
      }
    }
  }

  protected async preRegisterRouter(target, controllerId) {
    const app = this.app;
    const controllerOption: ControllerOption = getClassMetadata(CONTROLLER_KEY, target);
    let newRouter;
    if (controllerOption.prefix) {
      newRouter = new Router({
        sensitive: true,
      }, app);
      newRouter.prefix(controllerOption.prefix);
      // implement @middleware
      const middlewares = controllerOption.routerOptions.middleware;
      if (middlewares && middlewares.length) {
        for (const middleware of middlewares) {
          const middlewareImpl: WebMiddleware = await this.applicationContext.getAsync(middleware);
          if (middlewareImpl && middlewareImpl.resolve) {
            newRouter.use(middlewareImpl.resolve());
          }
        }
      }

      // implement @get @post
      const webRouterInfo: RouterOption[] = getClassMetadata(WEB_ROUTER_KEY, target);
      if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
        for (const webRouter of webRouterInfo) {
          // get middleware
          const middlewares = webRouter.middleware;
          const methodMiddlwares = [];
          if (middlewares && middlewares.length) {
            for (const middleware of middlewares) {
              const middlewareImpl: WebMiddleware = await this.applicationContext.getAsync(middleware);
              if (middlewareImpl && middlewareImpl.resolve) {
                methodMiddlwares.push(middlewareImpl.resolve());
              }
            }
          }

          const routerArgs = [
            webRouter.routerName,
            webRouter.path,
            ...methodMiddlwares,
            this.generateController(`${controllerId}.${webRouter.method}`)
          ].concat(methodMiddlwares);

          // apply controller from request context
          newRouter[webRouter.requestMethod].apply(newRouter, routerArgs);
        }
      }
    }

    // sort for priority
    if (newRouter) {
      const priority = getClassMetadata(PRIORITY_KEY, target);
      this.prioritySortRouters.push({
        priority: priority || 0,
        router: newRouter,
      });
    }
  }

  /**
   * wrap controller string to middleware function
   * @param controllerMapping like xxxController.index
   */
  public generateController(controllerMapping: string) {
    const mappingSplit = controllerMapping.split('.');
    const controllerId = mappingSplit[0];
    const methodName = mappingSplit[1];
    return async (ctx, next) => {
      const controller = await ctx.requestContext.getAsync(controllerId);
      return controller[methodName].call(controller, ctx, next);
    };
  }

  public async refreshContext(): Promise<void> {
    // 虽然有点hack，但是将就着用吧
    if (Array.isArray(this.config.configLocations)) {
      this.applicationContext.configLocations = this.config.configLocations;
      this.applicationContext.props.putObject(this.config);
    }

    await this.containerLoader.refresh();
    await this.preloadControllerFromXml();
  }

  // Get the real plugin path
  protected getPluginPath(plugin) {
    if (plugin.path) {
      return plugin.path;
    }

    const name = plugin.package || plugin.name;
    const lookupDirs = [];

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
          debug(`pluginContext register [${prop as string}]`);
          self.pluginContext.registerObject(prop, attributes.value);
        }
        return Object.defineProperty(target, prop, attributes);
      }
    });

    this.getLoadUnits()
      .forEach(unit => {
        // 兼容旧插件加载方式
        const ret = this.loadFile(this.resolveModule(path.join(unit.path, fileName)));
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

  get applicationContext() {
    return this.containerLoader.getApplicationContext();
  }

  get pluginContext() {
    return this.containerLoader.getPluginContext();
  }

  loadApplicationContext() {
    // this.app.options.container 测试用例编写方便点
    const containerConfig = this.config.container || this.app.options.container || {};
    // 在 super constructor 中会调用到getAppInfo，之后会被赋值
    // 如果是typescript会加上 dist 或者 src 目录
    this.containerLoader = new ContainerLoader({
      baseDir: this.baseDir,
      isTsMode: this.isTsMode
    });
    this.containerLoader.initialize();
    this.applicationContext.registerObject('appDir', this.appDir);
    // 如果没有关闭autoLoad 则进行load
    this.containerLoader.loadDirectory(containerConfig);

    // register handler for container
    this.containerLoader.registerAllHook(MidwayHandlerKey.CONFIG, (key) => {
      return this.config[key];
    });

    this.containerLoader.registerAllHook(MidwayHandlerKey.PLUGIN, (key) => {
      return this.pluginContext.get(key);
    });

    this.containerLoader.registerAllHook(MidwayHandlerKey.LOGGER, (key) => {
      if (this.app.getLogger) {
        return this.app.getLogger(key);
      }
      return this.options.logger;
    });
  }
}
