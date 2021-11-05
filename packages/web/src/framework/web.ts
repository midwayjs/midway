import {
  BaseFramework,
  IMidwayBootstrapOptions,
  MidwayProcessTypeEnum,
  PathFileUtil,
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

const debug = debuglog('midway:egg');

class EggControllerGenerator extends WebControllerGenerator<EggRouter> {
  constructor(readonly app, readonly applicationContext, readonly logger) {
    super(applicationContext, MidwayFrameworkType.WEB, logger);
  }

  createRouter(routerOptions: any): EggRouter {
    const router = new EggRouter(routerOptions, this.app);
    router.prefix(routerOptions.prefix);
    return router;
  }

  generateController(controllerMapping, routeArgsInfo, routerResponseData) {
    return this.generateKoaController(
      controllerMapping,
      routeArgsInfo,
      routerResponseData
    );
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
  generator;
  private server: Server;
  private agent;

  @Inject()
  appDir;

  public configure() {
    process.env.EGG_TYPESCRIPT = 'true';
    return this.configService.getConfiguration('egg');
  }

  async initSingleProcessEgg() {
    debug('web framework: init egg');
    const opts = {
      baseDir: this.appDir,
      framework: resolve(__dirname, '../application'),
      plugins: this.configurationOptions.plugins,
      mode: 'single',
      isTsMode: true,
      applicationContext: this.applicationContext,
      midwaySingleton: true,
    };

    const Agent = require(opts.framework).Agent;
    const Application = require(opts.framework).Application;
    const agent = (this.agent = new Agent(Object.assign({}, opts)));
    await agent.ready();
    const application = (this.app = new Application(Object.assign({}, opts)));
    application.agent = agent;
    agent.application = application;

    if (this.app.config.midwayFeature['replaceEggLogger']) {
      // if use midway logger will be use midway custom context logger
      this.app.ContextLogger = this.BaseContextLoggerClass;
    }
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    await this.initSingleProcessEgg();
    // insert error handler
    this.app.use(async (ctx, next) => {
      // this.app.createAnonymousContext(ctx);
      const { result, error } = await (
        await this.getMiddleware()
      )(ctx as any, next);
      if (error) {
        throw error;
      }
      if (result) {
        ctx.body = result;
      }
    });
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

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // 单进程下，先把egg的配置覆盖进来，有可能业务测没写 importConfigs
    this.configService.addObject(this.app.config);
    Object.defineProperty(this.app, 'config', {
      get() {
        return self.getConfiguration();
      },
    });

    this.generator = new EggControllerGenerator(
      this.app,
      this.applicationContext,
      this.appLogger
    );

    this.defineApplicationProperties(
      {
        generateController: (controllerMapping: string) => {
          return this.generator.generateController(controllerMapping);
        },

        generateMiddleware: async (middlewareId: string) => {
          return this.generateMiddleware(middlewareId);
        },

        getProcessType: () => {
          if (this.configurationOptions.processType === 'application') {
            return MidwayProcessTypeEnum.APPLICATION;
          }
          if (this.configurationOptions.processType === 'agent') {
            return MidwayProcessTypeEnum.AGENT;
          }

          // TODO 单进程模式下区分进程类型??
          return MidwayProcessTypeEnum.APPLICATION;
        },
      },
      ['createAnonymousContext']
    );

    // hack use method
    (this.app as any).originUse = this.app.use;
    this.app.use = this.app.useMiddleware as any;

    if (this.app.config.midwayFeature['replaceEggLogger']) {
      // if use midway logger will be use midway custom context logger
      this.app.beforeStart(() => {
        this.app.ContextLogger = this.BaseContextLoggerClass;
      });
    }

    Object.defineProperty(this.app, 'applicationContext', {
      get() {
        return self.applicationContext;
      },
    });

    await new Promise<void>(resolve => {
      this.app.once('application-ready', () => {
        debug('web framework: init egg end');
        resolve();
      });
      (this.app.loader as any).loadOrigin();
    });
  }

  protected async initializeLogger() {
    // 不需要在这里创建框架日志，从 egg 代理过来
    this.logger = this.app.coreLogger;
    this.appLogger = this.app.logger;
  }

  async loadMidwayController() {
    await this.generator.loadMidwayController(newRouter => {
      this.app.use(newRouter.middleware());
    });
  }

  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB;
  }

  async run(): Promise<void> {
    // load controller
    await this.loadMidwayController();
    // restore use method
    this.app.use = (this.app as any).originUse;

    const eggConfig = this.configService.getConfiguration('egg');
    if (this.configService.getConfiguration('egg')) {
      new Promise<void>(resolve => {
        const args: any[] = [eggConfig.port];
        if (eggConfig.hostname) {
          args.push(eggConfig.hostname);
        }
        args.push(() => {
          resolve();
        });
        this.server.listen(...args);
      });
    }
  }

  public getLogger(name?: string) {
    if (name) {
      return this.app.loggers[name] || loggers.getLogger(name);
    }
    return this.appLogger;
  }

  protected setContextLoggerClass(BaseContextLogger: any) {
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
    await new Promise(resolve => {
      this.server.close(resolve);
    });
    await this.app.close();
    await this.agent.close();
  }
}
