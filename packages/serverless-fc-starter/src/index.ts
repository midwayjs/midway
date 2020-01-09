import { BaseBootstrap } from '@midwayjs/runtime-engine';
import { FCRuntime } from './runtime';

export { asyncWrapper } from '@midwayjs/runtime-engine';
export * from './runtime';
export * from './wrapper';

let bootstrap;

export const start = async (options: any = {}) => {
  bootstrap = new BaseBootstrap(
    Object.assign(
      {
        runtime: new FCRuntime(),
      },
      options
    )
  );
  await bootstrap.start();
  return bootstrap.getRuntime();
};

export const close = async () => {
  return bootstrap.close();
};
