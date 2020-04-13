import { FaaSContext, IFaaSStarter, MidwayFaaSInfo } from './interface';
import { join, dirname, resolve } from 'path';
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
const MIDWAY_FAAS_KEY = '__midway_faas__';

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
    this.baseDir = this.getBaseDir();

    this.loader = new ContainerLoader({
      baseDir: this.baseDir,
      isTsMode: true, // 用 midway-faas 只能是 ts
      preloadModules: options.preloadModules || [],
    });
    this.loader.initialize();

    // 合并 runtime config
    const configService = this.loader
      .getApplicationContext()
      .getConfigService();
    configService.addObject(this.globalConfig);
  }

  initConfiguration(filePath: string, fileDir?: string) {
    if (!fileDir) {
      fileDir = dirname(resolve(filePath));
    }
    const container = this.loader.getApplicationContext();
    const cfg = container.createConfiguration();
    cfg.namespace = MIDWAY_FAAS_KEY;
    cfg.loadConfiguration(require(filePath), fileDir);
  }

  prepareConfiguration() {
    // TODO use initConfiguration
    // this.initConfiguration('./configuration', __dirname);
  }

  getBaseDir() {
    if (isTypeScriptEnvironment()) {
      return join(this.appDir, 'src');
    } else {
      return join(this.appDir, 'dist');
    }
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
      method: string;
      descriptor: any;
    } = this.funMappingStore.get(handlerMapping);

    return async (...args) => {
      if (args.length === 0) {
        throw new Error('first parameter must be function context');
      }

      const context: FaaSContext = this.getContext(args.shift());

      if (funOptions && funOptions.mod) {
        // invoke middleware, just for http
        let fnMiddlewere = [];
        fnMiddlewere = fnMiddlewere.concat(this.globalMiddleware);
        fnMiddlewere = fnMiddlewere.concat(funOptions.middleware);
        if (fnMiddlewere.length) {
          const mw: any[] = await this.formatMiddlewares(fnMiddlewere);
          mw.push(async (ctx) => {
            // invoke handler
            const result = this.invokeHandler(funOptions, ctx, args);
            if (!ctx.body) {
              ctx.body = result;
            }
          });
          return compose(mw)(context).then(() => {
            return context.body;
          });
        } else {
          // invoke handler
          return this.invokeHandler(funOptions, context, args);
        }
      }

      throw new Error(`function handler = ${handlerMapping} not found`);
    };
  }

  async invokeHandler(
    funOptions: {
      mod: any;
      middleware: Array<IMiddleware<FaaSContext>>;
      method: string;
    },
    context,
    args
  ) {
    const funModule = await context.requestContext.getAsync(funOptions.mod);
    const handlerName =
      this.getFunctionHandler(context, args, funModule, funOptions.method) ||
      this.defaultHandlerMethod;
    if (funModule[handlerName]) {
      // invoke real method
      return funModule[handlerName].apply(funModule, args);
    }
  }

  protected getFunctionHandler(ctx, args, target, method): string {
    if (method && typeof target[method] !== 'undefined') {
      return method;
    }
    const handlerMethod = this.defaultHandlerMethod;
    if (handlerMethod && typeof target[handlerMethod] !== 'undefined') {
      return handlerMethod;
    }
    throw new Error(
      `no handler setup on ${target.name}#${
        method || this.defaultHandlerMethod
      }`
    );
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
      // add configuration support
      this.prepareConfiguration();

      this.loader.loadDirectory(Object.assign(opts, containerOptions));
      this.registerDecorator();
      await this.loader.refresh();

      // store all function entry
      const funModules = listModule(FUNC_KEY);
      for (const funModule of funModules) {
        const funOptions: Array<{
          funHandler;
          key;
          descriptor;
          middleware: string[];
        }> = getClassMetadata(FUNC_KEY, funModule);
        funOptions.map((opts) => {
          // { method: 'handler', data: 'index.handler' }
          const handlerName = opts.funHandler
            ? // @Func(key), if key is set
              // or @Func({ handler })
              opts.funHandler
            : // else use ClassName.mehtod as handler key
              covertId(funModule.name, opts.key);
          this.funMappingStore.set(handlerName, {
            middleware: opts.middleware || [],
            mod: funModule,
            method: opts.key,
            descriptor: opts.descriptor,
          });
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
        this.getApplicationContext()
      );
    }
    if (!context.env) {
      context.env = this.getApplicationContext()
        .getEnvironmentService()
        .getCurrentEnvironment();
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

function covertId(cls, method) {
  return cls.replace(/^[A-Z]/, (c) => c.toLowerCase()) + '.' + method;
}
