import { FaaSContext, IFaaSStarter, MidwayFaaSInfo } from './interface';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  getClassMetadata,
  listModule,
  listPreloadModule,
  REQUEST_OBJ_CTX_KEY,
} from 'injection';
import { FUNC_KEY } from './constant';
import {
  ContainerLoader,
  MidwayContainer,
  MidwayHandlerKey,
  MidwayRequestContainer,
} from 'midway-core';

import SimpleLock from '@midwayjs/simple-lock';

const LOCK_KEY = '_faas_starter_start_key';

function isTypeScriptEnvironment() {
  return !!require.extensions['.ts'] || process.env.MIDWAY_TS_MODE === 'true';
}

export class FaaSStarter implements IFaaSStarter {
  baseDir: string;
  appDir: string;
  defaultHandlerMethod = 'handler';
  defaultRouterName = 'handler';
  loader: ContainerLoader;
  globalConfig: object;
  isTsMode: boolean;
  funMappingStore: Map<string, any> = new Map();
  logger;
  private lock = new SimpleLock();

  constructor(
    options: {
      baseDir?: string;
      config?: object;
      typescript?: boolean;
      preloadModules?: any[];
      logger?: any;
    } = {}
  ) {
    this.appDir = options.baseDir || process.cwd();
    this.globalConfig = options.config || {};
    this.logger = options.logger || console;
    this.isTsMode = this.getTsMode(options.typescript);
    this.baseDir = this.getBaseDir();

    this.loader = new ContainerLoader({
      baseDir: this.baseDir,
      isTsMode: this.isTsMode,
      preloadModules: options.preloadModules || [],
    });
    this.loader.initialize();
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
    // register handler for container
    this.loader.registerHook(MidwayHandlerKey.CONFIG, key => {
      return this.globalConfig[key];
    });

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
    const funModule = this.funMappingStore.get(handlerMapping);

    return async (...args) => {
      if (args.length === 0) {
        throw new Error('first parameter must be function context');
      }

      const context: FaaSContext = this.getContext(args.shift());
      if (funModule) {
        const funModuleIns = await context.requestContext.getAsync(funModule);
        return this.invokeHandler(
          funModuleIns,
          this.getFunctionHandler(context, args, funModuleIns),
          args
        );
      }

      throw new Error(`function handler = ${handlerMapping} not found`);
    };
  }

  async invokeHandler(funModule, handlerName, args) {
    handlerName = handlerName || this.defaultHandlerMethod;
    if (funModule[handlerName]) {
      // invoke real method
      return funModule[handlerName].apply(funModule, args);
    }
  }

  protected getFunctionHandler(ctx, args, target): string {
    const handlerMethod = this.defaultHandlerMethod;
    return handlerMethod;
  }

  async start(
    opts: {
      disableAutoLoad?: boolean;
      cb?: () => Promise<void>;
    } = {}
  ) {

    return this.lock.sureOnce(async () => {
      let containerOptions = {};
      try {
        const containerOptPath = require.resolve(join(this.appDir, 'ioc'));
        containerOptions = require(containerOptPath);
        if (typeof containerOptions === 'function') {
          containerOptions = containerOptions({
            baseDir: this.baseDir,
            appDir: this.appDir,
          } as MidwayFaaSInfo);
        }
      } catch (err) {
        // ignore
        this.logger.info('midway-faas: ioc config read fail and skip');
      }

      this.loader.loadDirectory(Object.assign(opts, containerOptions));
      this.registerDecorator();

      // store all function entry
      const funModules = listModule(FUNC_KEY);
      for (const funModule of funModules) {
        const funHandlerName: string = getClassMetadata(FUNC_KEY, funModule);
        this.funMappingStore.set(funHandlerName, funModule);
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
        this.loader.getApplicationContext(),
        context
      );
    }
    return context;
  }
}
