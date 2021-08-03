import { BaseBootstrap } from '@midwayjs/runtime-engine';
import { FCRuntime } from './runtime';

export { asyncWrapper } from '@midwayjs/runtime-engine';
export * from './runtime';

let bootstrap;

export const start = async (options: any = {}) => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  if (process.env['FC_FUNC_CODE_PATH']) {
    // 用于替换默认的上下文日志
    process.env['MIDWAY_SERVERLESS_REPLACE_LOGGER'] = 'true';
    // 移除控制台颜色，fc 控制台无法探测是否支持，日志采集也必须把颜色禁用掉
    process.env['MIDWAY_LOGGER_DISABLE_COLORS'] = 'true';
  }
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
