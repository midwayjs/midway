import { BaseBootstrap } from '@midwayjs/runtime-engine';
import { SCFRuntime } from './runtime';

export * from './runtime';
export * from './interface';
export { asyncWrapper } from '@midwayjs/runtime-engine';

let bootstrap;

export const start = async () => {
  bootstrap = new BaseBootstrap({
    runtime: new SCFRuntime(),
  });
  await bootstrap.start();
  return bootstrap.getRuntime();
};

export const close = async () => {
  return bootstrap.close();
};
