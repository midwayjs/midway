import {
  BaseFramework,
  HTTP_SERVER_KEY,
  httpError,
  IMidwayBootstrapOptions,
  MidwayProcessTypeEnum,
  MidwayWebRouterService,
  PathFileUtil,
  RouterInfo,
  WebControllerGenerator,
  Framework,
  Inject,
  MidwayFrameworkType,
} from '@midwayjs/core';
import {
  IMidwayWebConfigurationOptions,
  Application,
  Context,
} from '../interface';
import { EggRouter } from '@eggjs/router';
import { EggLogger } from 'egg';
import { loggers, MidwayContextLogger } from '@midwayjs/logger';
import { resolve } from 'path';
import { Server } from 'net';
import { debuglog } from 'util';

const debug = debuglog('midway:debug');

class EggControllerGenerator extends WebControllerGenerator<EggRouter> {
  constructor(readonly app, readonly webRouterService: MidwayWebRouterService) {
    super(app, webRouterService);
  }

  createRouter(routerOptions: any): EggRouter {
    const router = new EggRouter(routerOptions, this.app);
    router.prefix(routerOptions.prefix);
    return router;
  }

  generateController(routeInfo: RouterInfo) {
    return this.generateKoaController(routeInfo);
  }
}

@Framework()
export class MidwayWebFramework extends BaseFramework<
  Application,
  Context,
  IMidwayWebConfigurationOptions
> {
  protected loggers: {
    [name: string]: EggLogger;
  };
  private generator: EggControllerGenerator;
  private server: Server;
  private agent;
  private isClusterMode = false;
  private webRouterService: MidwayWebRouterService;

  @Inject()
  appDir;

  public configure() {
    process.env.EGG_TYPESCRIPT = 'true';
    if (process.env['EGG_CLUSTER_MODE'] === 'true') {
      this.isClusterMode = true;
    }
    return this.configService.getConfiguration('egg');
  }

  async initSingleProcessEgg() {
    const opts = {
      baseDir: this.appDir,
      framework: resolve(__dirname, '../application'),
      plugins: this.configurationOptions.plugins,
      mode: 'single',
      isTsMode: true,
      applicationContext: this.applicationContext,
      midwaySingleton: true,
    };

    debug('[egg]: init single process egg agent');
    const Agent = require(opts.framework).Agent;
    const Application = require(opts.framework).Application;
    const agent = (this.agent = new Agent(Object.assign({}, opts)));
    await agent.ready();
    debug('[egg]: init single process egg application');
    const application = (this.app = new Application(Object.assign({}, opts)));
    application.agent = agent;
    agent.application = application;
    debug('[egg]: init single process egg end');
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    if (!this.isClusterMode) {
      await this.initSingleProcessEgg();
    } else {
      // get app in cluster mode
      this.app = options['application'];
    }

    // not found middleware
    const midwayRouterNotFound = async (ctx, next) => {
      await next();
      if (!ctx._matchedRoute && ctx.body === undefined) {
        throw new httpError.NotFoundError(`${ctx.path} Not Found`);
      }
    };

    // insert error handler
    const midwayRootMiddleware = async (ctx, next) => {
      await (
        await this.applyMiddleware(midwayRouterNotFound)
      )(ctx as any, next);
    };
    this.app.use(midwayRootMiddleware);
    this.webRouterService = await this.applicationContext.getAsync(
      MidwayWebRouterService,
      [
        {
          globalPrefix: this.configurationOptions.globalPrefix,
        },
      ]
    );
    this.generator = new EggControllerGenerator(
      this.app,
      this.webRouterService
    );

    this.overwriteApplication('app');

    (this.app.loader as any).loadOrigin();
    // 这里拦截 app.use 方法，让他可以加到 midway 的 middlewareManager 中
    (this.app as any).originUse = this.app.use;
    this.app.use = this.app.useMiddleware as any;

    if (!this.isClusterMode) {
      await new Promise<void>(resolve => {
        this.app.once('application-ready', () => {
          debug('[egg]: web framework: init egg end');
          resolve();
        });
        this.app.ready();
      });
    }
  }

  overwriteApplication(processType) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // 单进程下，先把egg的配置覆盖进来，有可能业务测没写 importConfigs
    debug(`[egg]: overwrite egg config to configService in "${processType}"`);
    this.configService.addObject(this.app.config);
    Object.defineProperty(this.app, 'config', {
      get() {
        return self.getConfiguration();
      },
    });

    debug(`[egg]: overwrite applicationContext config to "${processType}"`);
    Object.defineProperty(this.app, 'applicationContext', {
      get() {
        return self.applicationContext;
      },
    });

    debug(`[egg]: overwrite properties to "${processType}"`);
    this.defineApplicationProperties(
      {
        generateController: (controllerMapping: string) => {
          const [controllerId, methodName] = controllerMapping.split('.');
          return this.generator.generateController({
            id: controllerId,
            method: methodName,
          } as any);
        },

        generateMiddleware: async (middlewareId: any) => {
          return this.generateMiddleware(middlewareId);
        },

        getProcessType: () => {
          if (processType === 'app') {
            return MidwayProcessTypeEnum.APPLICATION;
          }
          if (processType === 'agent') {
            return MidwayProcessTypeEnum.AGENT;
          }
        },

        createContextLogger: (ctx, name) => {
          return this.createContextLogger(ctx, name);
        },
      },
      ['createAnonymousContext']
    );

    // if use midway logger will be use midway custom context logger
    debug(`[egg]: overwrite BaseContextLoggerClass to "${processType}"`);
    this.setContextLoggerClass();
  }

  async loadMidwayController() {
    // move egg router to last
    this.app.getMiddleware().findAndInsertLast('eggRouterMiddleware');
    await this.generator.loadMidwayController(newRouter => {
      const dispatchFn = newRouter.middleware();
      dispatchFn._name = `midwayController(${newRouter?.opts?.prefix || '/'})`;
      this.app.useMiddleware(dispatchFn);
    });

    // restore use method
    this.app.use = (this.app as any).originUse;

    debug(`[egg]: current middleware = ${this.middlewareManager.getNames()}`);
  }

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB;
  }

  async run(): Promise<void> {
    // cluster 模式加载路由需在 run 之前，因为 run 需要在拿到 server 之后执行
    if (!this.isClusterMode) {
      // load controller
      await this.loadMidwayController();
      // https config
      if (this.configurationOptions.key && this.configurationOptions.cert) {
        this.configurationOptions.key = PathFileUtil.getFileContentSync(
          this.configurationOptions.key
        );
        this.configurationOptions.cert = PathFileUtil.getFileContentSync(
          this.configurationOptions.cert
        );
        this.configurationOptions.ca = PathFileUtil.getFileContentSync(
          this.configurationOptions.ca
        );

        if (this.configurationOptions.http2) {
          this.server = require('http2').createSecureServer(
            this.configurationOptions,
            this.app.callback()
          );
        } else {
          this.server = require('https').createServer(
            this.configurationOptions,
            this.app.callback()
          );
        }
      } else {
        if (this.configurationOptions.http2) {
          this.server = require('http2').createServer(this.app.callback());
        } else {
          this.server = require('http').createServer(this.app.callback());
        }
      }
      // emit egg-ready message in agent and application
      this.app.messenger.broadcast('egg-ready', undefined);

      // emit `server` event in app
      this.app.emit('server', this.server);

      // register httpServer to applicationContext
      this.getApplicationContext().registerObject(HTTP_SERVER_KEY, this.server);

      const eggConfig = this.configService.getConfiguration('egg');
      if (!this.isClusterMode && eggConfig) {
        const customPort = process.env.MIDWAY_HTTP_PORT ?? eggConfig.port;
        if (customPort) {
          new Promise<void>(resolve => {
            const args: any[] = [customPort];
            if (eggConfig.hostname) {
              args.push(eggConfig.hostname);
            }
            args.push(() => {
              resolve();
            });
            this.server.listen(...args);
            process.env.MIDWAY_HTTP_PORT = String(customPort);
          });
        }
      }
    }
  }

  public getLogger(name?: string) {
    if (name) {
      return this.app.loggers[name] || loggers.getLogger(name);
    }
    return this.appLogger;
  }

  public setContextLoggerClass() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    class MidwayEggContextLogger extends MidwayContextLogger<Context> {
      constructor(ctx, appLogger) {
        super(ctx, appLogger, {
          contextFormat: self.contextLoggerFormat,
        });
      }
    }
    this.app.ContextLogger = MidwayEggContextLogger as any;
  }

  public async generateMiddleware(middlewareId: any) {
    const mwIns: any = await this.getApplicationContext().getAsync(
      middlewareId
    );
    return mwIns.resolve();
  }

  async beforeStop() {
    if (!this.isClusterMode) {
      await new Promise(resolve => {
        this.server.close(resolve);
      });
      await this.app.close();
      await this.agent.close();
    }
  }

  public setServer(server) {
    this.server = server;
  }
}
