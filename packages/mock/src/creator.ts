import {
  destroyGlobalApplicationContext,
  initializeGlobalApplicationContext,
  BaseFramework,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayFramework,
  MidwayFrameworkService,
  loadModule,
  MidwayCommonError,
  MidwayApplicationManager,
  MidwayConfigService,
  getCurrentApplicationContext,
  CONFIGURATION_KEY,
  Framework,
  sleep,
  ObjectIdentifier,
  isTypeScriptEnvironment,
  DecoratorManager,
  DynamicMidwayContainer,
} from '@midwayjs/core';
import { isAbsolute, join, resolve } from 'path';
import { clearAllLoggers, loggers } from '@midwayjs/logger';
import {
  ComponentModule,
  IBootstrapAppStarter,
  MockBootstrapOptions,
} from './interface';
import {
  findFirstExistModule,
  isTestEnvironment,
  isWin32,
  mergeGlobalConfig,
  removeFile,
  transformFrameworkToConfiguration,
} from './utils';
import { debuglog } from 'util';
import { existsSync, readFileSync } from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as yaml from 'js-yaml';
import * as getRawBody from 'raw-body';

const debug = debuglog('midway:debug');

process.setMaxListeners(0);

function formatPath(baseDir, p) {
  if (isAbsolute(p)) {
    return p;
  } else {
    return resolve(baseDir, p);
  }
}

function getFileNameWithSuffix(fileName: string) {
  return isTypeScriptEnvironment() ? `${fileName}.ts` : `${fileName}.js`;
}

function createMockWrapApplicationContext() {
  const container = new DynamicMidwayContainer();
  debug(`[mock]: Create mock MidwayContainer, id=${container.id}.`);
  const bindModuleMap: WeakMap<any, boolean> = new WeakMap();

  container.onBeforeBind(target => {
    bindModuleMap.set(target, true);
  });
  DecoratorManager['_bindModuleMap'] = bindModuleMap;

  // 这里设置是因为在 midway 单测中会不断的复用装饰器元信息，又不能清理缓存，所以在这里做一些过滤
  if (!DecoratorManager['_mocked']) {
    DecoratorManager['_listModule'] = DecoratorManager.listModule;
    DecoratorManager['_saveModule'] = DecoratorManager.saveModule;
    DecoratorManager.saveModule = (key, target) => {
      if (key === CONFIGURATION_KEY) {
        // 防止重复，测试的时候 configuration 会被重复 save
        const modules = DecoratorManager['_listModule'](key);
        if (modules.some((module: any) => module.target === target.target)) {
          return;
        } else {
          DecoratorManager['_bindModuleMap'].set(target.target, true);
          DecoratorManager['_saveModule'](key, target);
        }
      } else {
        DecoratorManager['_saveModule'](key, target);
      }
    };
    DecoratorManager.listModule = key => {
      const modules = DecoratorManager['_listModule'](key);
      return modules.filter((module: any) => {
        if (key === CONFIGURATION_KEY) {
          return DecoratorManager['_bindModuleMap'].has(module.target);
        }
        if (DecoratorManager['_bindModuleMap'].has(module)) {
          return true;
        } else {
          debug(
            '[mock]: Filter "%o" module without binding when list module %s.',
            module.name ?? module,
            key
          );
          return false;
        }
      });
    };
    DecoratorManager['_mocked'] = true;
  }
  return container;
}

export async function create<
  T extends IMidwayFramework<any, any, any, any, any>
>(
  appDir: string | MockBootstrapOptions,
  options: MockBootstrapOptions = {}
): Promise<T> {
  process.env.MIDWAY_TS_MODE = process.env.MIDWAY_TS_MODE ?? 'true';

  if (typeof appDir === 'object') {
    options = appDir;
    appDir = options.appDir || '';
  }

  debug(`[mock]: Create app, appDir="${appDir}"`);

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
    } else {
      appDir = process.cwd();
    }

    clearAllLoggers();

    options = options || ({} as any);

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

    if (!options.moduleLoadType) {
      const pkgJSON = await loadModule(join(appDir, 'package.json'), {
        safeLoad: true,
        enableCache: false,
      });

      options.moduleLoadType = pkgJSON?.type === 'module' ? 'esm' : 'commonjs';
    }

    if (options.baseDir) {
      if (!isAbsolute(options.baseDir)) {
        options.baseDir = join(appDir, options.baseDir);
      }
      await loadModule(
        join(`${options.baseDir}`, getFileNameWithSuffix('interface')),
        {
          safeLoad: true,
          loadMode: options.moduleLoadType,
        }
      );
    } else if (appDir) {
      options.baseDir = join(appDir, 'src');
      await loadModule(
        join(`${options.baseDir}`, getFileNameWithSuffix('interface')),
        {
          safeLoad: true,
          loadMode: options.moduleLoadType,
        }
      );
    }

    if (options.ssl) {
      const sslConfig = {
        koa: {
          key: join(__dirname, '../ssl/ssl.key'),
          cert: join(__dirname, '../ssl/ssl.pem'),
        },
        egg: {
          key: join(__dirname, '../ssl/ssl.key'),
          cert: join(__dirname, '../ssl/ssl.pem'),
        },
        express: {
          key: join(__dirname, '../ssl/ssl.key'),
          cert: join(__dirname, '../ssl/ssl.pem'),
        },
      };
      options.globalConfig = mergeGlobalConfig(options.globalConfig, sslConfig);
    }

    const container = createMockWrapApplicationContext();
    options.applicationContext = container;

    await initializeGlobalApplicationContext({
      ...options,
      appDir,
      loggerFactory: loggers,
    });

    const frameworkService = await container.getAsync(MidwayFrameworkService);
    const mainFramework = frameworkService.getMainFramework() as T;
    if (mainFramework) {
      return mainFramework;
    } else {
      throw new Error(
        `Can not get main framework, please check your ${getFileNameWithSuffix(
          'configuration'
        )}.`
      );
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
  baseDir: string | MockBootstrapOptions,
  options?: MockBootstrapOptions
): Promise<ReturnType<T['getApplication']>> {
  const framework: T = await create<T>(baseDir, options);
  return framework.getApplication();
}

export async function close(
  app: IMidwayApplication<any> | { close: (...args) => void },
  options?: {
    cleanLogsDir?: boolean;
    cleanTempDir?: boolean;
    sleep?: number;
  }
) {
  if (!app) return;
  if (
    app instanceof BootstrapAppStarter ||
    (typeof app['close'] === 'function' && !app['getConfig'])
  ) {
    await app['close'](options);
  } else {
    app = app as IMidwayApplication<any>;
    debug(`[mock]: Closing app, appDir=${app.getAppDir()}`);
    options = options || {};

    await destroyGlobalApplicationContext(app.getApplicationContext());
    if (isTestEnvironment()) {
      // clean first
      if (options.cleanLogsDir && !isWin32()) {
        await removeFile(join(app.getAppDir(), 'logs'));
      }
      if ('egg' === app.getNamespace()) {
        if (options.cleanTempDir && !isWin32()) {
          await removeFile(join(app.getAppDir(), 'run'));
        }
      }
      if (options.sleep > 0) {
        await sleep(options.sleep);
      } else {
        await sleep(50);
      }
    }
  }
}

export async function createFunctionApp<
  T extends IMidwayFramework<any, any, any, any, any>,
  Y = ReturnType<T['getApplication']>
>(
  baseDir?: string | MockBootstrapOptions,
  options: MockBootstrapOptions = {},
  customFrameworkModule?: { new (...args): T } | ComponentModule
): Promise<Y> {
  process.env.MIDWAY_TS_MODE = process.env.MIDWAY_TS_MODE ?? 'true';
  if (typeof baseDir === 'object') {
    options = baseDir;
    baseDir = options.appDir || '';
  }

  // v3 新的处理 bootstrap 过来的 faas 入口
  if (options.entryFile) {
    const exportModules: {
      getStarter: () => { close: () => void; start: (...args) => any };
    } = require(formatPath(baseDir, options.entryFile));
    options.starter = exportModules.getStarter();
  }

  let starterName;
  // 老的 f.yml 逻辑
  if (!options.starter) {
    if (!baseDir) {
      baseDir = process.cwd();
    }
    // load yaml
    try {
      const doc = yaml.load(readFileSync(join(baseDir, 'f.yml'), 'utf8'));
      starterName = doc?.['provider']?.['starter'];
      if (starterName) {
        const m = await loadModule(starterName);
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
    options.applicationContext = createMockWrapApplicationContext();
    options.appDir = baseDir;
    debug(`[mock]: Create app, appDir="${options.appDir}"`);

    if (options.appDir) {
      // 处理测试的 fixtures
      if (!isAbsolute(options.appDir)) {
        options.appDir = join(
          process.cwd(),
          'test',
          'fixtures',
          options.appDir
        );
      }

      if (!existsSync(options.appDir)) {
        throw new MidwayCommonError(
          `Path "${options.appDir}" not exists, please check it.`
        );
      }
    }

    clearAllLoggers();

    const pkgJSON = await loadModule(join(options.appDir, 'package.json'), {
      safeLoad: true,
      enableCache: false,
    });

    options.moduleLoadType = pkgJSON?.type === 'module' ? 'esm' : 'commonjs';

    if (options.baseDir) {
      await loadModule(
        join(`${options.baseDir}`, getFileNameWithSuffix('interface')),
        {
          safeLoad: true,
          loadMode: options.moduleLoadType,
        }
      );
    } else if (options.appDir) {
      options.baseDir = `${options.appDir}/src`;
      await loadModule(
        join(`${options.baseDir}`, getFileNameWithSuffix('interface')),
        {
          safeLoad: true,
          loadMode: options.moduleLoadType,
        }
      );
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
    const app = appManager.getApplication('faas');

    const faasConfig = configService.getConfiguration('faas') ?? {};
    const customPort =
      process.env.MIDWAY_HTTP_PORT ?? faasConfig['port'] ?? options['port'];

    if (options.starter.callback2) {
      app.callback2 = options.starter.callback2.bind(options.starter);
    } else {
      app.callback2 = () => {
        // mock a real http server response for local dev
        return async (req, res) => {
          const url = new URL(req.url, `http://${req.headers.host}`);
          req.query = Object.fromEntries(url.searchParams);
          req.path = url.pathname;
          // 如果需要解析body并且body是个stream，函数网关不会接受比 10m 更大的文件了
          if (
            ['post', 'put', 'delete'].indexOf(req.method.toLowerCase()) !==
              -1 &&
            !(req as any).body &&
            typeof req.on === 'function'
          ) {
            (req as any).body = await getRawBody(req, {
              limit: '10mb',
            });
          }

          req.getOriginEvent = () => {
            return options.starter?.createDefaultMockHttpEvent() || {};
          };
          req.getOriginContext = () => {
            return options.starter?.createDefaultMockContext() || {};
          };

          try {
            const ctx = await framework.wrapHttpRequest(req);

            // create event and invoke
            const result = await framework.invokeTriggerFunction(
              ctx,
              url.pathname,
              {
                isHttpFunction: true,
              }
            );
            const { statusCode, headers, body, isBase64Encoded } =
              result as any;
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
            if (isBase64Encoded && typeof body === 'string') {
              res.end(Buffer.from(body, 'base64'));
            } else {
              res.end(body);
            }
          } catch (err) {
            if (/favicon\.ico not found/.test(err.message)) {
              res.statusCode = 404;
              res.end();
              return;
            }
            console.error(err);
            res.statusCode = err.status || 500;
            res.end(err.message);
          }
        };
      };
    }

    app.getServerlessInstance = async (
      serviceClass:
        | ObjectIdentifier
        | {
            new (...args): T;
          },
      customContext = {}
    ) => {
      const instance = new Proxy(
        {},
        {
          get: (target, prop) => {
            let funcInfo;
            if (typeof serviceClass === 'string') {
              funcInfo = framework['funMappingStore'].get(
                `${serviceClass}.${prop as string}`
              );
            } else {
              funcInfo = Array.from(framework['funMappingStore'].values()).find(
                (item: any) => {
                  return (
                    item.id ===
                      DecoratorManager.getProviderUUId(serviceClass as any) &&
                    item.method === prop
                  );
                }
              );
            }

            if (funcInfo) {
              return async (...args) => {
                const context = app.createAnonymousContext({
                  originContext:
                    customContext ??
                    options.starter?.createDefaultMockContext() ??
                    {},
                  originEvent:
                    args[0] ?? options.starter?.createDefaultMockEvent() ?? {},
                });
                return framework.invokeTriggerFunction(
                  context,
                  funcInfo.funcHandlerName,
                  {
                    isHttpFunction: false,
                  }
                );
              };
            }
          },
        }
      ) as T;
      return instance;
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
    const serverlessModule = await transformFrameworkToConfiguration(
      customFramework,
      options.moduleLoadType
    );
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
    return appManager.getApplication('serverless-app');
  }
}

/**
 * 一个全量的空框架
 */
class LightFramework extends BaseFramework<any, any, any, any, any> {
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

class BootstrapAppStarter implements IBootstrapAppStarter {
  constructor(protected options: MockBootstrapOptions) {}
  getApp(type: string): IMidwayApplication<any> {
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
    const BootstrapModule = await loadModule('@midwayjs/bootstrap', {
      loadMode: this.options.moduleLoadType,
      safeLoad: true,
    });
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
 * @param baseDirOrOptions
 * @param options
 */
export async function createLightApp(
  baseDirOrOptions: string | MockBootstrapOptions,
  options: MockBootstrapOptions = {}
): Promise<IMidwayApplication> {
  if (baseDirOrOptions && typeof baseDirOrOptions === 'object') {
    options = baseDirOrOptions;
    baseDirOrOptions = options.baseDir || '';
  }

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

  if (!options.moduleLoadType) {
    const cwd = process.cwd();
    const pkgJSON = await loadModule(join(cwd, 'package.json'), {
      safeLoad: true,
      enableCache: false,
    });

    options.moduleLoadType = pkgJSON?.type === 'module' ? 'esm' : 'commonjs';
  }

  const app = await createApp(baseDirOrOptions as string, {
    ...options,
    imports: [
      await transformFrameworkToConfiguration(
        LightFramework,
        options.moduleLoadType
      ),
    ].concat(options?.imports),
  });

  const applicationManager = app
    .getApplicationContext()
    .get(MidwayApplicationManager);
  const apps = applicationManager.getApplications();
  if (apps.length === 1) {
    return app;
  } else {
    // 如果有多个 app，则重置 main app
    const frameworkService = app
      .getApplicationContext()
      .get(MidwayFrameworkService);
    // 这里调整是因为 createLightApp 会自动加一个 framework
    frameworkService.setMainApp(apps[0].getNamespace());
    return frameworkService.getMainApp();
  }
}

export async function createBootstrap(
  entryFile: string,
  options: MockBootstrapOptions = {}
): Promise<IBootstrapAppStarter> {
  const cwd = process.cwd();
  if (!options.bootstrapMode) {
    options.bootstrapMode = existsSync(join(cwd, 'node_modules/@midwayjs/faas'))
      ? 'faas'
      : 'app';
  }

  if (options.bootstrapMode === 'faas') {
    options.entryFile = entryFile;
    const app = await createFunctionApp(cwd, options);
    return {
      close: async () => {
        return close(app);
      },
    };
  } else {
    await create(undefined, {
      entryFile,
    });
    return new BootstrapAppStarter(options);
  }
}
