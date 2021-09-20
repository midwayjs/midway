import { Bootstrap, BootstrapStarter } from '@midwayjs/bootstrap';
import {
  IMidwayApplication, IMidwayContainer,
  IMidwayFramework,
  LightFramework,
  MidwayFrameworkType,
  safeRequire,
} from '@midwayjs/core';
import { isAbsolute, join, resolve } from 'path';
import { remove } from 'fs-extra';
import { clearAllModule, sleep } from '@midwayjs/decorator';
import { clearAllLoggers } from '@midwayjs/logger';
import * as os from 'os';

process.setMaxListeners(0);

function isTestEnvironment() {
  const testEnv = ['test', 'unittest'];
  return (
    testEnv.includes(process.env.MIDWAY_SERVER_ENV) ||
    testEnv.includes(process.env.EGG_SERVER_ENV) ||
    testEnv.includes(process.env.NODE_ENV)
  );
}

function isWin32() {
  return os.platform() === 'win32';
}

function findFirstExistModule(moduleList): string {
  for (const name of moduleList) {
    if (!name) continue;
    try {
      require.resolve(name);
      return name;
    } catch (e) {
      // ignore
    }
  }
}

const appMap = new WeakMap();
const bootstrapAppSet = (global['MIDWAY_BOOTSTRAP_APP_SET'] = new Set<{
  framework: IMidwayFramework<any, any>;
  starter: BootstrapStarter;
}>());

function getIncludeFramework(dependencies): string {
  const currentFramework = [
    '@midwayjs/web',
    '@midwayjs/koa',
    '@midwayjs/express',
    '@midwayjs/serverless-app',
    '@midwayjs/grpc',
    '@midwayjs/rabbitmq',
    '@midwayjs/socketio',
    '@midwayjs/faas',
  ];
  for (const frameworkName of currentFramework) {
    if (dependencies[frameworkName]) {
      return frameworkName;
    }
  }
}

function formatPath(baseDir, p) {
  if (isAbsolute(p)) {
    return p;
  } else {
    return resolve(baseDir, p);
  }
}

export type MockAppConfigurationOptions = {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
  entryFile?: string;
  baseDir?: string;
  bootstrapTimeout?: number;
  applicationContext?: IMidwayContainer;
  configurationModule?: any;
};

let lastAppDir;

export async function create<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions']
>(
  appDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions,
  customFrameworkName?: string | MidwayFrameworkType | any
): Promise<T> {
  process.env.MIDWAY_TS_MODE = 'true';

  // 处理测试的 fixtures
  if (!isAbsolute(appDir)) {
    appDir = join(process.cwd(), 'test', 'fixtures', appDir);
  }

  if (lastAppDir && lastAppDir !== appDir) {
    // 当目录不同才清理缓存，相同目录的装饰器只加载一次，清理了就没了
    clearAllModule();
  }
  lastAppDir = appDir;
  global['MIDWAY_BOOTSTRAP_APP_SET'].clear();
  // clearContainerCache();
  clearAllLoggers();

  options = options || ({} as any);
  if (options.baseDir) {
    safeRequire(join(`${options.baseDir}`, 'interface'));
  } else {
    safeRequire(join(`${appDir}`, 'src/interface'));
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
        }
      }, 200);
    });
    // 这里为了兼容下 cli 的老逻辑
    if (bootstrapAppSet.size) {
      const obj = bootstrapAppSet.values().next().value;
      return obj.framework;
    }
    return;
  }

  let framework: T = null;
  let DefaultFramework;

  // find framework
  if (customFrameworkName) {
    if (typeof customFrameworkName === 'string') {
      DefaultFramework = require(customFrameworkName as string).Framework;
    } else {
      DefaultFramework = customFrameworkName;
    }
  } else {
    // find default framework from pkg
    const pkg = require(join(appDir, 'package.json'));
    if (pkg.dependencies || pkg.devDependencies) {
      customFrameworkName = getIncludeFramework(
        Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {})
      );
    }
    DefaultFramework = require(customFrameworkName as string).Framework;
  }

  options = options ?? ({} as U);

  // got options from framework
  if (DefaultFramework) {
    framework = new DefaultFramework();
    if (framework.getFrameworkType() === MidwayFrameworkType.WEB) {
      // add egg-mock plugin for @midwayjs/web test, provide mock method
      options = Object.assign(options || {}, {
        plugins: {
          'egg-mock': {
            enable: true,
            package: 'egg-mock',
          },
          'midway-mock': {
            enable: true,
            package: '@midwayjs/mock',
          },
          watcher: false,
          development: false,
        },
      }) as any;
    }
    framework.configure(options);
  } else {
    throw new Error('framework not found');
  }

  const starter = new BootstrapStarter();
  starter
    .configure({
      appDir,
      baseDir: options.baseDir,
      applicationContext: options.applicationContext,
      configurationModule: options.configurationModule,
    })
    .load(framework as any);

  await starter.init();
  await starter.run();

  appMap.set(framework.getApplication(), starter);

  return framework;
}

export async function createApp<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions'],
  Y = ReturnType<T['getApplication']>
>(
  baseDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions,
  customFrameworkName?: string | MidwayFrameworkType | any
): Promise<Y> {
  const framework: T = await create<T, U>(
    baseDir,
    options,
    customFrameworkName
  );
  return framework.getApplication() as unknown as Y;
}

export async function close(
  app: IMidwayApplication | IMidwayFramework<any, any>,
  options?: {
    cleanLogsDir?: boolean;
    cleanTempDir?: boolean;
    sleep?: number;
  }
) {
  if (!app) return;
  options = options || {};
  let newApp: IMidwayApplication;
  if ((app as IMidwayFramework<any, any>).getApplication) {
    newApp = (app as IMidwayFramework<any, any>).getApplication();
  } else {
    newApp = app as IMidwayApplication;
  }
  const starter = appMap.get(newApp);
  if (starter) {
    await starter.stop();
    appMap.delete(newApp);
    bootstrapAppSet.clear();
  }

  if (isTestEnvironment()) {
    // clean first
    if (options.cleanLogsDir && !isWin32()) {
      await remove(join(newApp.getAppDir(), 'logs'));
    }
    if (MidwayFrameworkType.WEB === newApp.getFrameworkType()) {
      if (options.cleanTempDir && !isWin32()) {
        await remove(join(newApp.getAppDir(), 'run'));
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
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions'],
  Y = ReturnType<T['getApplication']>
>(
  baseDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions,
  customFrameworkName?: string | MidwayFrameworkType | any
): Promise<Y> {
  const customFramework =
    customFrameworkName ??
    findFirstExistModule([
      process.env.MIDWAY_SERVERLESS_APP_NAME,
      '@ali/serverless-app',
      '@midwayjs/serverless-app',
    ]);

  const framework: T = await create<T, U>(baseDir, options, customFramework);
  return framework.getApplication() as unknown as Y;
}

export async function createLightApp(
  baseDir: string = process.cwd(),
  options?: MockAppConfigurationOptions
): Promise<IMidwayApplication> {
  return await createApp(baseDir, options, LightFramework);
}

class BootstrapAppStarter {
  getApp(type: MidwayFrameworkType): IMidwayApplication<any> {
    const appMap = Bootstrap.starter.getBootstrapAppMap();
    return appMap.get(type);
  }

  async close(
    options: {
      sleep?: number;
    } = {}
  ) {
    await Bootstrap.stop();
    if (options.sleep > 0) {
      await sleep(options.sleep);
    } else {
      await sleep(50);
    }
  }
}

export async function createBootstrap(
  entryFile: string
): Promise<BootstrapAppStarter> {
  await create(undefined, {
    entryFile,
  });
  return new BootstrapAppStarter();
}
