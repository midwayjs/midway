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
} from '@midwayjs/core';
import { isAbsolute, join } from 'path';
import { remove } from 'fs-extra';
import { CONFIGURATION_KEY, Framework, sleep } from '@midwayjs/decorator';
import { clearAllLoggers } from '@midwayjs/logger';
import { ComponentModule, MockAppConfigurationOptions } from './interface';
import {
  findFirstExistModule,
  isTestEnvironment,
  isWin32,
  transformFrameworkToConfiguration,
} from './utils';
import { debuglog } from 'util';
import { existsSync } from 'fs';
const debug = debuglog('midway:debug');

process.setMaxListeners(0);

export async function create<
  T extends IMidwayFramework<any, any, any, any, any>
>(
  appDir: string = process.cwd(),
  options?: MockAppConfigurationOptions,
  customFramework?: { new (...args): T } | ComponentModule
): Promise<T> {
  debug(`[mock]: Create app, appDir="${appDir}"`);
  process.env.MIDWAY_TS_MODE = 'true';

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
  options?: MockAppConfigurationOptions,
  customFrameworkModule?: { new (...args): T } | ComponentModule
): Promise<Y> {
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
      options = {};
      options.imports = [serverlessModule];
    }
  }

  const framework = await createApp(baseDir, options);
  framework.configurationOptions = options;
  return framework;
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
