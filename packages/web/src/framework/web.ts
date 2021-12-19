import {
  BaseFramework,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  MidwayProcessTypeEnum,
  PathFileUtil,
  RouterInfo,
  WebControllerGenerator,
} from '@midwayjs/core';
import { Framework, Inject, MidwayFrameworkType } from '@midwayjs/decorator';
import { IMidwayWebConfigurationOptions } from '../interface';
import { EggRouter } from '@eggjs/router';
import { Application, Context, EggLogger } from 'egg';
import { loggers } from '@midwayjs/logger';
import { resolve } from 'path';
import { Server } from 'net';
import { debuglog } from 'util';
import { MidwayEggContextLogger } from '../logger';

const debug = debuglog('midway:debug');

class EggControllerGenerator extends WebControllerGenerator<EggRouter> {
  constructor(readonly app) {
    super(app);
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
  generator: EggControllerGenerator;
  private server: Server;
  private agent;
  private isClusterMode = false;

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
    }
    // insert error handler
    const midwayRootMiddleware = async (ctx, next) => {
      // this.app.createAnonymousContext(ctx);
      await (
        await this.applyMiddleware()
      )(ctx as any, next);
    };
    this.app.use(midwayRootMiddleware);

    this.generator = new EggControllerGenerator(this.app);

    this.overwriteApplication('app');

    await new Promise<void>(resolve => {
      this.app.once('application-ready', () => {
        debug('[egg]: web framework: init egg end');
        resolve();
      });
      (this.app.loader as any).loadOrigin();
      // 这里拦截 app.use 方法，让他可以加到 midway 的 middlewareManager 中
      (this.app as any).originUse = this.app.use;
      this.app.use = this.app.useMiddleware as any;

      this.app.ready();
    });
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

        generateMiddleware: async (middlewareId: string) => {
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
      },
      ['createAnonymousContext']
    );

    // if use midway logger will be use midway custom context logger
    debug(`[egg]: overwrite BaseContextLoggerClass to "${processType}"`);
    this.setContextLoggerClass(
      this.configService.getConfiguration('egg.ContextLoggerClass') ||
        MidwayEggContextLogger
    );
  }

  async loadMidwayController() {
    await this.generator.loadMidwayController(
      this.configurationOptions.globalPrefix,
      newRouter => {
        const dispatchFn = newRouter.middleware();
        dispatchFn._name = `midwayController(${
          newRouter?.opts?.prefix || '/'
        })`;
        this.app.useMiddleware(dispatchFn);
      }
    );
  }

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB;
  }

  async run(): Promise<void> {
    // move egg router to last
    this.app.getMiddleware().findAndInsertLast('eggRouterMiddleware');
    // load controller
    await this.loadMidwayController();
    // restore use method
    this.app.use = (this.app as any).originUse;

    debug(`[egg]: current middleware = ${this.middlewareManager.getNames()}`);

    if (!this.isClusterMode) {
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

  public setContextLoggerClass(BaseContextLogger: any) {
    this.BaseContextLoggerClass = BaseContextLogger;
    this.app.ContextLogger = BaseContextLogger;
  }

  public async generateMiddleware(middlewareId: string) {
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
}
