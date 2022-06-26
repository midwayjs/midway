import { IMidwayFramework, MidwayApplicationManager, MidwayFrameworkType } from '@midwayjs/core';
import { createApp } from '@midwayjs/mock';
import * as ServerlessApp from '../src';

export async function createFunctionApp<
  T extends IMidwayFramework<any, any, any, any, any>,
  Y = ReturnType<T['getApplication']>
  >(
  baseDir: string = process.cwd(),
  options?,
): Promise<Y> {
  options = options ?? {};
  options.imports = [ServerlessApp];
  const framework = await createApp(baseDir, options);
  const appCtx = framework.getApplicationContext();
  const appManager = appCtx.get(MidwayApplicationManager);
  return appManager.getApplication(MidwayFrameworkType.SERVERLESS_APP);
}
