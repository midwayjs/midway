import { EggRouter as Router } from '@eggjs/router';
import {
  CONTROLLER_KEY,
  ControllerOption,
  KoaMiddleware,
  PRIORITY_KEY,
  RouterOption,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
  RouterParamValue
} from '@midwayjs/decorator';
import * as extend from 'extend2';
import * as fs from 'fs';
import { getClassMetadata, getMethodDataFromClass, getProviderId, listModule } from 'injection';
import { ContainerLoader, MidwayHandlerKey, MidwayContainer } from 'midway-core';
import * as path from 'path';
import { MidwayLoaderOptions, WebMiddleware } from '../interface';
import { isTypeScriptEnvironment } from '../utils';
import { EggAppInfo } from 'egg';

const debug = require('debug')(`midway:loader:${process.pid}`);
const EggLoader = require('egg-core').EggLoader;

const TS_SRC_DIR = 'src';
const TS_TARGET_DIR = 'dist';

export class MidwayWebLoader extends EggLoader {
  public baseDir: string;
  public appDir: string;
  public appInfo: EggAppInfo;
  private controllerIds: string[] = [];
  private prioritySortRouters: Array<{
    priority: number,
    router: Router,
  }> = [];
  private containerLoader: ContainerLoader;

  constructor(options: MidwayLoaderOptions) {
    super(options);
  }

  /**
   * 判断是否是 ts 模式，在构造器内就会被执行
   */
  get isTsMode(): boolean {
    return this.app.options.typescript;
  }

  get applicationContext(): MidwayContainer {
    return this.containerLoader.getApplicationContext();
  }

  get pluginContext(): any {
    return this.containerLoader.getPluginContext();
  }

  // loadPlugin -> loadConfig -> afterLoadConfig
  protected loadConfig(): void {
    this.loadPlugin();
    super.loadConfig();
  }

  // Get the real plugin path
  protected getPluginPath(plugin: any): string {
    if (plugin && plugin.path) {
      return plugin.path;
    }

    const name: string = plugin.package || plugin.name;
    const lookupDirs: string[] = [];

    // 尝试在以下目录找到匹配的插件
    //  -> {APP_PATH}/node_modules
    //    -> {EGG_PATH}/node_modules
    //      -> $CWD/node_modules
    lookupDirs.push(path.join(this.appDir, 'node_modules'));

    // 到 egg 中查找，优先从外往里查找
    for (let i = this.eggPaths.length - 1; i >= 0; i--) {
      const eggPath: string = this.eggPaths[i];
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

  protected registerTypescriptDirectory(): void {
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

  protected getEggPaths(): string[] {
    if (!this.appDir) {
      // register appDir here
      this.registerTypescriptDirectory();
    }
    return super.getEggPaths();
  }

  protected getServerEnv(): string {
    let serverEnv: string;

    const envPath = path.join(this.appDir, 'config/env');
    if (fs.existsSync(envPath)) {
      serverEnv = fs.readFileSync(envPath, 'utf8').trim();
    }

    if (!serverEnv) {
      serverEnv = super.getServerEnv();
    }

    return serverEnv;
  }

  protected getAppInfo(): EggAppInfo {
    if (!this.appInfo) {
      const appInfo: EggAppInfo | undefined = super.getAppInfo();
      // ROOT == HOME in prod env
      this.appInfo = extend(true, appInfo, {
        root: appInfo.env === 'local' || appInfo.env === 'unittest' ? this.appDir : appInfo.root,
        appDir: this.appDir,
      });
    }
    return this.appInfo;
  }

  protected loadApplicationContext(): void {
    // this.app.options.container 测试用例编写方便点
    const containerConfig = this.config.container || this.app.options.container || {};
    if (!containerConfig.loadDir) {
      // 如果没有配置，默认就把扫描目录改到 /src or /dist
      containerConfig.baseDir = this.baseDir;
    }
    // 在 super constructor 中会调用到getAppInfo，之后会被赋值
    // 如果是typescript会加上 dist 或者 src 目录
    this.containerLoader = new ContainerLoader({
      baseDir: this.appDir,
      isTsMode: this.isTsMode
    });
    this.containerLoader.initialize();
    this.applicationContext.registerObject('appDir', this.appDir);
    // 如果没有关闭autoLoad 则进行load
    this.containerLoader.loadDirectory(containerConfig);

    // register handler for container
    this.containerLoader.registerAllHook(MidwayHandlerKey.CONFIG, (key: string) => {
      return this.config[key];
    });

    this.containerLoader.registerAllHook(MidwayHandlerKey.PLUGIN, (key: string) => {
      return this.app[key] || this.pluginContext.get(key);
    });

    this.containerLoader.registerAllHook(MidwayHandlerKey.LOGGER, (key: string) => {
      if (this.app.getLogger) {
        return this.app.getLogger(key);
      }
      return this.options.logger;
    });
  }

  protected async preRegisterRouter(target: any, controllerId: string): Promise<void> {
    const controllerOption: ControllerOption = getClassMetadata(CONTROLLER_KEY, target);
    const newRouter = this.createEggRouter(controllerOption);

    if (newRouter) {
      // implement middleware in controller
      const middlewares = controllerOption.routerOptions.middleware;
      await this.handlerWebMiddleware(middlewares, (middlewareImpl: KoaMiddleware) => {
        newRouter.use(middlewareImpl);
      });

      // implement @get @post
      const webRouterInfo: RouterOption[] = getClassMetadata(WEB_ROUTER_KEY, target);

      if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
        for (const webRouter of webRouterInfo) {
          // get middleware
          const middlewares = webRouter.middleware;
          const methodMiddlwares = [];

          await this.handlerWebMiddleware(middlewares, (middlewareImpl: KoaMiddleware) => {
            methodMiddlwares.push(middlewareImpl);
          });

          // implement @body @query @param @body
          const routeArgsInfo = getMethodDataFromClass(WEB_ROUTER_PARAM_KEY, target, webRouter.method) || [];

          const routerArgs = [
            webRouter.routerName,
            webRouter.path,
            ...methodMiddlwares,
            this.generateController(
              `${controllerId}.${webRouter.method}`,
              routeArgsInfo,
            )
          ];

          // apply controller from request context
          newRouter[webRouter.requestMethod].apply(newRouter, routerArgs);
        }
      }

    // sort for priority
      const priority = getClassMetadata(PRIORITY_KEY, target);
      this.prioritySortRouters.push({
        priority: priority || 0,
        router: newRouter,
      });
    }

  }


  private async handlerWebMiddleware<T extends any = any>(
    middlewares: T[],
    handlerCallback: (ps: T | ReturnType<WebMiddleware['resolve']>) => any,
  ): Promise<void> {

    if (middlewares && middlewares.length) {
      for (const middleware of middlewares) {
        if (typeof middleware === 'function') {
          // web function middleware
          handlerCallback(middleware);
        } else {
          const middlewareImpl: WebMiddleware = await this.applicationContext.getAsync(middleware);
          if (middlewareImpl && middlewareImpl.resolve) {
            handlerCallback(middlewareImpl.resolve());
          }
        }
      }
    }
  }

  /**
   * @param controllerOption
   */
  private createEggRouter(controllerOption: ControllerOption) {
    const { prefix , routerOptions: { sensitive }}  = controllerOption;
    if (prefix) {
      const router = new Router({ sensitive }, this.app);
      router.prefix(prefix);
      return router;
    }
    return null;
  }

  protected async refreshContext(): Promise<void> {
    await this.containerLoader.refresh();
  }

  /**
   * wrap controller string to middleware function
   * @param controllerMapping like xxxController.index
   */
  public generateController(controllerMapping: string, routeArgsInfo?: RouterParamValue[]) {
    const [controllerId, methodName] = controllerMapping.split('.');
    return async (ctx, next) => {
      const args = [ctx, next];
      if (Array.isArray(routeArgsInfo)) {
        await Promise.all(routeArgsInfo.map(async({index, extractValue}) => {
          args[index] = await extractValue(ctx, next);
        }));
      }
      const controller = await ctx.requestContext.getAsync(controllerId);
      return controller[methodName].apply(controller, args);
    };
  }

  public async loadMidwayController(): Promise<void> {
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

}
