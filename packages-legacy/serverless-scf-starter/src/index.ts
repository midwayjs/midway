import { BaseBootstrap } from '@midwayjs/runtime-engine';
import { SCFRuntime } from './runtime';

export * from './runtime';
export { asyncWrapper } from '@midwayjs/runtime-engine';

let bootstrap;

export const start = async (options: any = {}) => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  bootstrap = new BaseBootstrap(
    Object.assign(
      {
        runtime: new SCFRuntime(),
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
