import {
  destroyGlobalApplicationContext,
  initializeGlobalApplicationContext,
  BaseFramework,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayFramework,
  MidwayFrameworkService,
  MidwayFrameworkType,
  safeRequire,
  MidwayContainer,
  MidwayCommonError,
  MidwayApplicationManager,
  MidwayConfigService,
  getCurrentApplicationContext,
  CONFIGURATION_KEY,
  Framework,
  sleep,
} from '@midwayjs/core';
import { isAbsolute, join, resolve } from 'path';
import { remove } from 'fs-extra';
import { clearAllLoggers } from '@midwayjs/logger';
import { ComponentModule, MockAppConfigurationOptions } from './interface';
import {
  findFirstExistModule,
  isTestEnvironment,
  isWin32,
  transformFrameworkToConfiguration,
} from './utils';
import { debuglog } from 'util';
import { existsSync, readFileSync } from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as yaml from 'js-yaml';
import * as getRawBody from 'raw-body';
import { createContextManager } from '@midwayjs/async-hooks-context-manager';

const debug = debuglog('midway:debug');

process.setMaxListeners(0);

function formatPath(baseDir, p) {
  if (isAbsolute(p)) {
    return p;
  } else {
    return resolve(baseDir, p);
  }
}

export async function create<
  T extends IMidwayFramework<any, any, any, any, any>
>(
  appDir: string = process.cwd(),
  options?: MockAppConfigurationOptions,
  customFramework?: { new (...args): T } | ComponentModule
): Promise<T> {
  debug(`[mock]: Create app, appDir="${appDir}"`);
  process.env.MIDWAY_TS_MODE = 'true';

  try {
    if (appDir) {
      // 处理测试的 fixtures
      if (!isAbsolute(appDir)) {
        appDir = join(process.cwd(), 'test', 'fixtures', appDir);
      }

      if (!existsSync(appDir)) {
        throw new MidwayCommonError(
          `Path "${appDir}" not exists, please check it.`
        );
      }
    }

    clearAllLoggers();

    options = options || ({} as any);
    if (options.baseDir) {
      safeRequire(join(`${options.baseDir}`, 'interface'));
    } else if (appDir) {
      options.baseDir = `${appDir}/src`;
      safeRequire(join(`${options.baseDir}`, 'interface'));
    }

    if (options.entryFile) {
      // start from entry file, like bootstrap.js
      options.entryFile = formatPath(appDir, options.entryFile);
      global['MIDWAY_BOOTSTRAP_APP_READY'] = false;
      // set app in @midwayjs/bootstrap
      require(options.entryFile);

      await new Promise<void>((resolve, reject) => {
        const timeoutHandler = setTimeout(() => {
          clearInterval(internalHandler);
          reject(new Error('[midway]: bootstrap timeout'));
        }, options.bootstrapTimeout || 30 * 1000);
        const internalHandler = setInterval(() => {
          if (global['MIDWAY_BOOTSTRAP_APP_READY'] === true) {
            clearInterval(internalHandler);
            clearTimeout(timeoutHandler);
            resolve();
          } else {
            debug('[mock]: bootstrap not ready and wait next check');
          }
        }, 200);
      });
      return;
    }

    if (!options.imports && customFramework) {
      options.imports = transformFrameworkToConfiguration(customFramework);
    }

    if (customFramework?.['Configuration']) {
      options.imports = customFramework;
      customFramework = customFramework['Framework'];
    }

    const container = new MidwayContainer();
    const bindModuleMap: WeakMap<any, boolean> = new WeakMap();
    // 这里设置是因为在 midway 单测中会不断的复用装饰器元信息，又不能清理缓存，所以在这里做一些过滤
    container.onBeforeBind(target => {
      bindModuleMap.set(target, true);
    });

    const originMethod = container.listModule;

    container.listModule = key => {
      const modules = originMethod.call(container, key);
      if (key === CONFIGURATION_KEY) {
        return modules;
      }

      return modules.filter((module: any) => {
        if (bindModuleMap.has(module)) {
          return true;
        } else {
          debug(
            '[mock] Filter "%o" module without binding when list module %s.',
            module.name ?? module,
            key
          );
          return false;
        }
      });
    };

    options.applicationContext = container;

    await initializeGlobalApplicationContext({
      ...options,
      appDir,
      asyncContextManager: createContextManager(),
      imports: []
        .concat(options.imports)
        .concat(
          options.baseDir
            ? safeRequire(join(options.baseDir, 'configuration'))
            : []
        ),
    });

    if (customFramework) {
      return container.getAsync(customFramework as any);
    } else {
      const frameworkService = await container.getAsync(MidwayFrameworkService);
      return frameworkService.getMainFramework() as T;
    }
  } catch (err) {
    // catch for jest beforeAll can't throw error
    if (process.env.JEST_WORKER_ID) {
      console.error(err);
    }
    throw err;
  }
}

export async function createApp<
  T extends IMidwayFramework<any, any, any, any, any>
>(
  baseDir: string = process.cwd(),
  options?: MockAppConfigurationOptions,
  customFramework?: { new (...args): T } | ComponentModule
): Promise<ReturnType<T['getApplication']>> {
  const framework: T = await create<T>(baseDir, options, customFramework);
  return framework.getApplication();
}

export async function close<T extends IMidwayApplication<any>>(
  app: T,
  options?: {
    cleanLogsDir?: boolean;
    cleanTempDir?: boolean;
    sleep?: number;
  }
) {
  if (!app) return;
  debug(`[mock]: Closing app, appDir=${app.getAppDir()}`);
  options = options || {};

  await destroyGlobalApplicationContext(app.getApplicationContext());
  if (isTestEnvironment()) {
    // clean first
    if (options.cleanLogsDir && !isWin32()) {
      await remove(join(app.getAppDir(), 'logs'));
    }
    if (MidwayFrameworkType.WEB === app.getFrameworkType()) {
      if (options.cleanTempDir && !isWin32()) {
        await remove(join(app.getAppDir(), 'run'));
      }
    }
    if (options.sleep > 0) {
      await sleep(options.sleep);
    } else {
      await sleep(50);
    }
  }
}

export async function createFunctionApp<
  T extends IMidwayFramework<any, any, any, any, any>,
  Y = ReturnType<T['getApplication']>
>(
  baseDir: string = process.cwd(),
  options: MockAppConfigurationOptions = {},
  customFrameworkModule?: { new (...args): T } | ComponentModule
): Promise<Y> {
  let starterName;
  if (!options.starter) {
    // load yaml
    try {
      const doc = yaml.load(readFileSync(join(baseDir, 'f.yml'), 'utf8'));
      starterName = doc?.['provider']?.['starter'];
      if (starterName) {
        const m = safeRequire(starterName);
        if (m && m['BootstrapStarter']) {
          options.starter = new m['BootstrapStarter']();
        }
      }
    } catch (e) {
      // ignore
      console.error('[mock]: get f.yml information fail, err = ' + e.stack);
    }
  }

  if (options.starter) {
    options.appDir = baseDir;
    debug(`[mock]: Create app, appDir="${options.appDir}"`);
    process.env.MIDWAY_TS_MODE = 'true';

    // 处理测试的 fixtures
    if (!isAbsolute(options.appDir)) {
      options.appDir = join(process.cwd(), 'test', 'fixtures', options.appDir);
    }

    if (!existsSync(options.appDir)) {
      throw new MidwayCommonError(
        `Path "${options.appDir}" not exists, please check it.`
      );
    }

    clearAllLoggers();

    options = options || ({} as any);
    if (options.baseDir) {
      safeRequire(join(`${options.baseDir}`, 'interface'));
    } else if (options.appDir) {
      options.baseDir = `${options.appDir}/src`;
      safeRequire(join(`${options.baseDir}`, 'interface'));
    }

    // new mode
    const exports = options.starter.start(options);
    await exports[options.initializeMethodName || 'initializer'](
      options['initializeContext']
    );
    const appCtx = options.starter.getApplicationContext();

    const configService = appCtx.get(MidwayConfigService) as any;
    const frameworkService = appCtx.get(MidwayFrameworkService) as any;
    const framework = frameworkService.getMainFramework();

    const appManager = appCtx.get(MidwayApplicationManager);
    const app = appManager.getApplication(MidwayFrameworkType.FAAS);

    const faasConfig = configService.getConfiguration('faas') ?? {};
    const customPort =
      process.env.MIDWAY_HTTP_PORT ?? faasConfig['port'] ?? options['port'];

    app.callback2 = () => {
      // mock a real http server response for local dev
      return async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        req.query = Object.fromEntries(url.searchParams);
        req.path = url.pathname;
        // 如果需要解析body并且body是个stream，函数网关不会接受比 10m 更大的文件了
        if (
          ['post', 'put', 'delete'].indexOf(req.method.toLowerCase()) !== -1 &&
          !(req as any).body &&
          typeof req.on === 'function'
        ) {
          (req as any).body = await getRawBody(req, {
            limit: '10mb',
          });
        }
        const ctx = await framework.wrapHttpRequest(req);

        // create event and invoke
        const result = await framework.invokeTriggerFunction(
          ctx,
          url.pathname,
          {
            isHttpFunction: true,
          }
        );
        const { statusCode, headers, body } = result as any;
        if (res.headersSent) {
          return;
        }

        for (const key in headers) {
          res.setHeader(key, headers[key]);
        }
        if (res.statusCode !== statusCode) {
          res.statusCode = statusCode;
        }

        // http trigger only support `Buffer` or a `string` or a `stream.Readable`
        res.end(body);
      };
    };

    if (customPort) {
      await new Promise<void>(resolve => {
        let server: http.Server | https.Server;
        if (options.ssl) {
          server = require('https').createServer(
            {
              key: readFileSync(join(__dirname, '../ssl/ssl.key'), 'utf8'),
              cert: readFileSync(join(__dirname, '../ssl/ssl.pem'), 'utf8'),
            },
            app.callback2()
          );
        } else {
          server = require('http').createServer(app.callback2());
        }
        server.listen(customPort);
        process.env.MIDWAY_HTTP_PORT = String(customPort);
        (app as any).server = server;
        resolve();
      });
    }
    return app as unknown as Y;
  } else {
    const customFramework =
      customFrameworkModule ??
      findFirstExistModule([
        process.env.MIDWAY_SERVERLESS_APP_NAME,
        '@ali/serverless-app',
        '@midwayjs/serverless-app',
      ]);
    const serverlessModule = transformFrameworkToConfiguration(customFramework);
    if (serverlessModule) {
      if (options && options.imports) {
        options.imports.unshift(serverlessModule);
      } else {
        options = options || {};
        options.imports = [serverlessModule];
      }
    }
    const framework = await createApp(baseDir, options);
    const appCtx = framework.getApplicationContext();
    const appManager = appCtx.get(MidwayApplicationManager);
    return appManager.getApplication(MidwayFrameworkType.SERVERLESS_APP);
  }
}

/**
 * 一个全量的空框架
 */
class LightFramework extends BaseFramework<any, any, any, any, any> {
  getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.LIGHT;
  }

  async run(): Promise<void> {}

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as IMidwayApplication;
    this.defineApplicationProperties();
  }

  configure(): any {
    return {};
  }

  getFrameworkName(): string {
    return 'lightFramework';
  }
}

class BootstrapAppStarter {
  getApp(type: MidwayFrameworkType | string): IMidwayApplication<any> {
    const applicationContext = getCurrentApplicationContext();
    const applicationManager = applicationContext.get(MidwayApplicationManager);
    return applicationManager.getApplication(type);
  }

  async close(
    options: {
      sleep?: number;
    } = {}
  ) {
    // eslint-disable-next-line node/no-extraneous-require
    const BootstrapModule = safeRequire('@midwayjs/bootstrap');
    if (BootstrapModule?.Bootstrap) {
      await BootstrapModule.Bootstrap.stop();
    }
    if (options.sleep > 0) {
      await sleep(options.sleep);
    } else {
      await sleep(50);
    }
  }
}

/**
 * Create a real project but not ready or a virtual project
 * @param baseDir
 * @param options
 */
export async function createLightApp(
  baseDir = '',
  options: MockAppConfigurationOptions = {}
): Promise<IMidwayApplication> {
  Framework()(LightFramework);
  options.globalConfig = Object.assign(
    {
      midwayLogger: {
        default: {
          disableFile: true,
          disableError: true,
        },
      },
    },
    options.globalConfig ?? {}
  );
  return createApp(baseDir, {
    ...options,
    imports: [transformFrameworkToConfiguration(LightFramework)].concat(
      options?.imports
    ),
  });
}

export async function createBootstrap(
  entryFile: string
): Promise<BootstrapAppStarter> {
  await create(undefined, {
    entryFile,
  });
  return new BootstrapAppStarter();
}
