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
  T extends IMidwayFramework<any, any, U>,
  U = T['configurationOptions']
>(
  appDir: string = process.cwd(),
  options?: MockAppConfigurationOptions,
  customFramework?: { new (...args): T } | ComponentModule
): Promise<T> {
  debug(`[mock]: Create app, appDir="${appDir}"`);
  process.env.MIDWAY_TS_MODE = 'true';

  // 处理测试的 fixtures
  if (!isAbsolute(appDir)) {
    appDir = join(process.cwd(), 'test', 'fixtures', appDir);
  }

  if (!existsSync(appDir)) {
    throw new MidwayCommonError(
      `Path "${appDir}" not exists, please check it.`
    );
  }

  clearAllLoggers();

  options = options || ({} as any);
  if (options.baseDir) {
    safeRequire(join(`${options.baseDir}`, 'interface'));
  } else {
    options.baseDir = `${appDir}/src`;
    safeRequire(join(`${options.baseDir}`, 'interface'));
  }

  if (!options.configurationModule && customFramework) {
    options.configurationModule =
      transformFrameworkToConfiguration(customFramework);
  }

  if (customFramework?.['Configuration']) {
    options.configurationModule = customFramework;
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
    configurationModule: []
      .concat(options.configurationModule)
      .concat(safeRequire(join(options.baseDir, 'configuration'))),
  });

  if (customFramework) {
    return container.getAsync(customFramework as any);
  } else {
    const frameworkService = await container.getAsync(MidwayFrameworkService);
    return frameworkService.getMainFramework() as T;
  }
}

export async function createApp<
  T extends IMidwayFramework<any, any, U>,
  U = T['configurationOptions'],
  Y = ReturnType<T['getApplication']>
>(
  baseDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions,
  customFramework?: { new (...args): T } | ComponentModule
): Promise<IMidwayApplication<any, any>> {
  const framework: T = await create<T, U>(baseDir, options, customFramework);
  return framework.getApplication() as unknown as Y;
}

export async function close(
  app: IMidwayApplication,
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
  T extends IMidwayFramework<any, any, U>,
  U = T['configurationOptions'],
  Y = ReturnType<T['getApplication']>
>(
  baseDir: string = process.cwd(),
  options?: MockAppConfigurationOptions,
  customFrameworkName?: { new (...args): T } | ComponentModule
): Promise<Y> {
  const customFramework =
    customFrameworkName ??
    findFirstExistModule([
      process.env.MIDWAY_SERVERLESS_APP_NAME,
      '@ali/serverless-app',
      '@midwayjs/serverless-app',
    ]);

  const framework = await createApp(
    baseDir,
    {
      ...options,
      configurationModule: transformFrameworkToConfiguration(customFramework),
    },
    customFrameworkName as any
  );
  framework.configurationOptions = options;
  return framework;
}

/**
 * 一个全量的空框架
 */
class LightFramework extends BaseFramework<any, any, any> {
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

export async function createLightApp(
  baseDir = '',
  options: MockAppConfigurationOptions = {}
): Promise<IMidwayApplication> {
  Framework()(LightFramework);
  return createApp(baseDir, {
    ...options,
    configurationModule: [
      transformFrameworkToConfiguration(LightFramework),
    ].concat(options?.configurationModule),
  });
}
