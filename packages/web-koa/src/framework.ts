import {
  BaseFramework,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
  PathFileUtil,
  WebControllerGenerator,
} from '@midwayjs/core';

import { Framework, RouterParamValue } from '@midwayjs/decorator';
import {
  IMidwayKoaApplication,
  IMidwayKoaConfigurationOptions,
  IMidwayKoaContext,
  IWebMiddleware,
} from './interface';
import * as Router from '@koa/router';
import type { DefaultState, Middleware } from 'koa';
import * as koa from 'koa';
import { Server } from 'net';

class KoaControllerGenerator extends WebControllerGenerator<Router> {
  constructor(readonly app, readonly applicationContext, readonly logger) {
    super(applicationContext, MidwayFrameworkType.WEB_KOA, logger);
  }

  createRouter(routerOptions: any): Router {
    const router = new Router(routerOptions);
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
export class MidwayKoaFramework extends BaseFramework<
  IMidwayKoaApplication,
  IMidwayKoaContext,
  IMidwayKoaConfigurationOptions
> {
  private server: Server;
  private generator: KoaControllerGenerator;

  configure(): IMidwayKoaConfigurationOptions {
    return this.configService.getConfiguration('koa');
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    this.app = new koa<
      DefaultState,
      IMidwayKoaContext
    >() as IMidwayKoaApplication;
    this.app.use(async (ctx, next) => {
      this.app.createAnonymousContext(ctx);
      const { result, error } = await (await this.getMiddleware())(ctx, next);
      if (error) {
        throw error;
      }
      if (result) {
        ctx.body = result;
      }
    });

    this.generator = new KoaControllerGenerator(
      this.app,
      this.applicationContext,
      this.appLogger
    );

    this.defineApplicationProperties({
      generateController: (controllerMapping: string) => {
        return this.generateController(controllerMapping);
      },
      /**
       * @deprecated
       * @param middlewareId
       */
      generateMiddleware: async (middlewareId: string) => {
        return this.generateMiddleware(middlewareId);
      },
    });

    // hack use method
    (this.app as any).originUse = this.app.use;
    this.app.use = this.app.useMiddleware as any;

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
    // register httpServer to applicationContext
    this.applicationContext.registerObject(HTTP_SERVER_KEY, this.server);
  }

  async loadMidwayController() {
    await this.generator.loadMidwayController(newRouter => {
      this.app.use(newRouter.middleware());
    });
  }

  /**
   * wrap controller string to middleware function
   * @param controllerMapping like FooController.index
   * @param routeArgsInfo
   * @param routerResponseData
   */
  public generateController(
    controllerMapping: string,
    routeArgsInfo?: RouterParamValue[],
    routerResponseData?: any[]
  ): Middleware<DefaultState, IMidwayKoaContext> {
    return this.generator.generateKoaController(
      controllerMapping,
      routeArgsInfo,
      routerResponseData
    );
  }

  /**
   * @deprecated
   * @param middlewareId
   */
  public async generateMiddleware(middlewareId: string) {
    const mwIns = await this.getApplicationContext().getAsync<IWebMiddleware>(
      middlewareId
    );
    return mwIns.resolve();
  }

  public async run(): Promise<void> {
    // load controller
    await this.loadMidwayController();
    // restore use method
    this.app.use = (this.app as any).originUse;

    // set port and listen server
    if (this.configurationOptions.port) {
      new Promise<void>(resolve => {
        const args: any[] = [this.configurationOptions.port];
        if (this.configurationOptions.hostname) {
          args.push(this.configurationOptions.hostname);
        }
        args.push(() => {
          resolve();
        });
        this.server.listen(...args);
      });
    }
  }

  public async beforeStop() {
    this.server.close();
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WEB_KOA;
  }

  public getFrameworkName() {
    return 'web:koa';
  }

  public getServer() {
    return this.server;
  }
}
