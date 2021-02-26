import { BootstrapStarter } from '@midwayjs/bootstrap';
import {
  clearContainerCache,
  IMidwayApplication,
  IMidwayFramework,
  MidwayFrameworkType,
  safeRequire,
} from '@midwayjs/core';
import { isAbsolute, join, resolve } from 'path';
import { remove } from 'fs-extra';
import { clearAllModule } from '@midwayjs/decorator';
import { existsSync } from 'fs';
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

const appMap = new WeakMap();
const bootstrapAppSet = (global['MIDWAY_BOOTSTRAP_APP_SET'] = new Set<{
  framework: IMidwayFramework<any, any>;
  starter: BootstrapStarter;
}>());

function getIncludeFramework(dependencies): string {
  const values: string[] = Object.values(MidwayFrameworkType);
  for (const name of Object.keys(dependencies)) {
    if (values.includes(name)) {
      return name;
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
};

export async function create<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions']
>(
  baseDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions,
  customFrameworkName?: string | MidwayFrameworkType | any
): Promise<T> {
  process.env.MIDWAY_TS_MODE = 'true';
  clearAllModule();
  clearContainerCache();
  clearAllLoggers();
  safeRequire(`${baseDir}/src/interface`);
  options = options || ({} as any);

  if (options.entryFile) {
    // start from entry file, like bootstrap.js
    options.entryFile = formatPath(baseDir, options.entryFile);
    global['MIDWAY_BOOTSTRAP_APP_READY'] = false;
    // set app in @midwayjs/bootstrap
    require(options.entryFile);

    await new Promise<void>((resolve, reject) => {
      const timeoutHandler = setTimeout(() => {
        clearInterval(internalHandler);
        reject(new Error('[midway]: bootstrap timeout'));
      }, 30 * 1000);
      const internalHandler = setInterval(() => {
        if (global['MIDWAY_BOOTSTRAP_APP_READY'] === true) {
          clearInterval(internalHandler);
          clearTimeout(timeoutHandler);
          resolve();
        }
      }, 200);
    });
    let currentFramework;
    // get app by framework
    if (bootstrapAppSet.size === 1) {
      currentFramework = Array.from(bootstrapAppSet.values())[0].framework;
    } else if (customFrameworkName) {
      for (const value of bootstrapAppSet.values()) {
        if (
          customFrameworkName === value.framework.getFrameworkName() ||
          customFrameworkName === value.framework.getFrameworkType()
        ) {
          currentFramework = value.framework;
        }
      }
    }

    if (!currentFramework) {
      throw new Error('[midway]: framework not found');
    }

    // set framework to current weakMap
    for (const value of bootstrapAppSet.values()) {
      appMap.set(value.framework, value.starter);
    }
    bootstrapAppSet.clear();

    return currentFramework;
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
    const pkg = require(join(baseDir, 'package.json'));
    if (pkg.dependencies) {
      customFrameworkName = getIncludeFramework(pkg.dependencies);
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

  if (!isAbsolute(baseDir)) {
    baseDir = join(process.cwd(), 'test', 'fixtures', baseDir);
  }

  if (!existsSync(baseDir)) {
    throw new Error(`${baseDir} not found`);
  }

  starter
    .configure({
      appDir: baseDir,
    })
    .load(framework);

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
  return (framework.getApplication() as unknown) as Y;
}

export async function close(
  app: IMidwayApplication | IMidwayFramework<any, any>,
  options?: any
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
    if (options.cleanLogsDir !== false && !isWin32()) {
      await remove(join(newApp.getAppDir(), 'logs'));
    }
    if (MidwayFrameworkType.WEB === newApp.getFrameworkType()) {
      if (options.cleanTempDir !== false && !isWin32()) {
        await remove(join(newApp.getAppDir(), 'run'));
      }
    }
  }
}

export async function createFunctionApp<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions'],
  Y = ReturnType<T['getApplication']>
>(
  baseDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions
): Promise<Y> {
  const framework: T = await create<T, U>(
    baseDir,
    options,
    '@midwayjs/serverless-app'
  );
  return (framework.getApplication() as unknown) as Y;
}
