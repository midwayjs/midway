import { FaaSContext, IFaaSStarter, MidwayFaaSInfo } from './interface';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  ContainerLoader,
  getClassMetadata,
  IMiddleware,
  listModule,
  listPreloadModule,
  MidwayContainer,
  MidwayHandlerKey,
  MidwayRequestContainer,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core';
import { FUNC_KEY } from '@midwayjs/decorator';
import SimpleLock from '@midwayjs/simple-lock';
import * as compose from 'koa-compose';

const LOCK_KEY = '_faas_starter_start_key';

function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}

export class FaaSStarter implements IFaaSStarter {
  baseDir: string;
  appDir: string;
  defaultHandlerMethod = 'handler';
  defaultRouterName = 'handler';
  loader: ContainerLoader;
  globalConfig: object;
  globalMiddleware: string[];
  isTsMode: boolean;
  funMappingStore: Map<string, any> = new Map();
  logger;
  private lock = new SimpleLock();

  constructor(
    options: {
      baseDir?: string;
      config?: object;
      middleware?: string[];
      typescript?: boolean;
      preloadModules?: any[];
      logger?: any;
    } = {}
  ) {
    this.appDir = options.baseDir || process.cwd();
    this.globalConfig = options.config || {};
    this.globalMiddleware = options.middleware || [];
    this.logger = options.logger || console;
    this.isTsMode = this.getTsMode(options.typescript);
    this.baseDir = this.getBaseDir();

    this.loader = new ContainerLoader({
      baseDir: this.baseDir,
      isTsMode: this.isTsMode,
      preloadModules: options.preloadModules || [],
    });
    this.loader.initialize();

    // 合并 runtime config
    const configService = this.loader
      .getApplicationContext()
      .getConfigService();
    configService.addObject(this.globalConfig);
  }

  getTsMode(typescript): boolean {
    if (typescript === undefined) {
      if (existsSync(join(this.appDir, 'tsconfig.json'))) {
        return true;
      }
      if (existsSync(join(this.appDir, 'package.json'))) {
        const pkg = require(join(this.appDir, 'package.json'));
        if (
          (pkg['devDependencies'] && pkg['devDependencies']['typescript']) ||
          (pkg['dependencies'] && pkg['dependencies']['typescript'])
        ) {
          return true;
        }
      }
      return !!existsSync(join(this.appDir, 'dist'));
    } else {
      return typescript;
    }
  }

  getBaseDir() {
    if (this.isTsMode) {
      if (isTypeScriptEnvironment()) {
        return join(this.appDir, 'src');
      } else {
        return join(this.appDir, 'dist');
      }
    }
    return this.appDir;
  }

  registerDecorator() {
    this.loader.registerHook(MidwayHandlerKey.PLUGIN, (key, target) => {
      const ctx = target[REQUEST_OBJ_CTX_KEY] || {};
      return ctx[key];
    });

    this.loader.registerHook(MidwayHandlerKey.LOGGER, (key, target) => {
      const ctx = target[REQUEST_OBJ_CTX_KEY] || {};
      return ctx['logger'];
    });
  }

  handleInvokeWrapper(handlerMapping: string) {
    const funOptions: {
      mod: any;
      middleware: Array<IMiddleware<FaaSContext>>;
    } = this.funMappingStore.get(handlerMapping);

    return async (...args) => {
      if (args.length === 0) {
        throw new Error('first parameter must be function context');
      }

      const context: FaaSContext = this.getContext(args.shift());
      if (funOptions && funOptions.mod) {
        // invoke middleware, just for http
        let fnMiddleawere = [];
        fnMiddleawere = fnMiddleawere.concat(this.globalMiddleware);
        fnMiddleawere = fnMiddleawere.concat(funOptions.middleware);
        if (fnMiddleawere.length) {
          const mw: any[] = await this.formatMiddlewares(fnMiddleawere);
          mw.push(async ctx => {
            // invoke handler
            const result = this.invokeHandler(funOptions.mod, ctx, args);
            if (!ctx.body) {
              ctx.body = result;
            }
          });
          return compose(mw)(context).then(() => {
            return context.body;
          });
        } else {
          // invoke handler
          return this.invokeHandler(funOptions.mod, context, args);
        }
      }

      throw new Error(`function handler = ${handlerMapping} not found`);
    };
  }

  async invokeHandler(modName, context, args) {
    const funModule = await context.requestContext.getAsync(modName);
    const handlerName =
      this.getFunctionHandler(context, args, funModule) ||
      this.defaultHandlerMethod;
    if (funModule[handlerName]) {
      // invoke real method
      return funModule[handlerName].apply(funModule, args);
    }
  }

  protected getFunctionHandler(ctx, args, target): string {
    return this.defaultHandlerMethod;
  }

  async start(
    opts: {
      disableAutoLoad?: boolean;
      cb?: () => Promise<void>;
    } = {}
  ) {
    return this.lock.sureOnce(async () => {
      let containerOptions = {};
      if (
        existsSync(join(this.appDir, 'ioc.js')) ||
        existsSync(join(this.appDir, 'ioc.json'))
      ) {
        const containerOptPath = require.resolve(join(this.appDir, 'ioc'));
        this.logger.info(
          'midway-faas: ioc config is deprecated，use @Configuration instead.'
        );
        containerOptions = require(containerOptPath);
        if (typeof containerOptions === 'function') {
          containerOptions = containerOptions({
            baseDir: this.baseDir,
            appDir: this.appDir,
          } as MidwayFaaSInfo);
        }
      }

      this.loader.loadDirectory(Object.assign(opts, containerOptions));
      this.registerDecorator();

      // store all function entry
      const funModules = listModule(FUNC_KEY);
      for (const funModule of funModules) {
        const funOptions: {
          funHandler;
          middleware: string[];
        } = getClassMetadata(FUNC_KEY, funModule);
        this.funMappingStore.set(funOptions.funHandler, {
          middleware: funOptions.middleware,
          mod: funModule,
        });
      }

      const modules = listPreloadModule();
      for (const module of modules) {
        // preload init context
        await this.getApplicationContext().getAsync(module);
      }
      // now only for test case
      if (typeof opts.cb === 'function') {
        await opts.cb();
      }
    }, LOCK_KEY);
  }

  getApplicationContext(): MidwayContainer {
    return this.loader.getApplicationContext();
  }

  getContext(context) {
    if (!context.requestContext) {
      context.requestContext = new MidwayRequestContainer(
        context,
        this.loader.getApplicationContext()
      );
    }
    return context;
  }

  private async formatMiddlewares(
    middlewares: Array<IMiddleware<FaaSContext>>
  ) {
    const mwArr = [];
    for (const mw of middlewares) {
      if (typeof mw === 'function') {
        mwArr.push(mw);
      } else {
        const middlewareImpl: IMiddleware<FaaSContext> = await this.getApplicationContext().getAsync(
          mw
        );
        if (middlewareImpl && typeof middlewareImpl.resolve === 'function') {
          mwArr.push(middlewareImpl.resolve());
        }
      }
    }
    return mwArr;
  }
}
