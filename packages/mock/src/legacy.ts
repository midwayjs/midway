import { createApp, createFunctionApp, createLightApp } from './creator';
import { CommonJSFileDetector, IMidwayFramework } from '@midwayjs/core';
import { defineConfiguration } from '@midwayjs/core/functional';

export async function createLegacyApp<
  T extends IMidwayFramework<any, any, any, any, any>
>(
  ...args: Parameters<typeof createApp>
): Promise<ReturnType<T['getApplication']>> {
  const appDir = typeof args[0] === 'string' ? args[0] : (args[0] ?? {}).appDir;
  const options = (typeof args[0] === 'string' ? args[1] : args[0]) ?? {};
  options.imports = [
    ...(options.imports ?? []),
    defineConfiguration({
      detector: new CommonJSFileDetector({
        conflictCheck: true,
      }),
    }),
  ];
  return createApp(appDir, options);
}

export async function createLegacyFunctionApp<
  T extends IMidwayFramework<any, any, any, any, any>
>(
  ...args: Parameters<typeof createFunctionApp>
): Promise<ReturnType<T['getApplication']>> {
  const appDir = typeof args[0] === 'string' ? args[0] : (args[0] ?? {}).appDir;
  const options = (typeof args[0] === 'string' ? args[1] : args[0]) ?? {};
  options.imports = [
    ...(options.imports ?? []),
    defineConfiguration({
      detector: new CommonJSFileDetector({
        conflictCheck: true,
      }),
    }),
  ];
  return createFunctionApp(appDir, options);
}

export async function createLegacyLightApp(...args) {
  const appDir = typeof args[0] === 'string' ? args[0] : (args[0] ?? {}).appDir;
  const options = (typeof args[0] === 'string' ? args[1] : args[0]) ?? {};
  options.imports = [
    ...(options.imports ?? []),
    defineConfiguration({
      detector: new CommonJSFileDetector({
        conflictCheck: true,
      }),
    }),
  ];
  return createLightApp(appDir, options);
}
