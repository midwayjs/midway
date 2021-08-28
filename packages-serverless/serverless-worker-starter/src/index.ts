import { BaseBootstrap, BootstrapOptions } from '@midwayjs/runtime-engine';
import { WorkerRuntime } from './runtime';

export * from './runtime';

let bootstrap;

export const start = async (options: BootstrapOptions = {}) => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  // TODO: remove these environ switches.
  if (process.env['FC_FUNC_CODE_PATH']) {
    // 用于替换默认的上下文日志
    process.env['MIDWAY_SERVERLESS_REPLACE_LOGGER'] = 'true';
    // 移除控制台颜色，fc 控制台无法探测是否支持，日志采集也必须把颜色禁用掉
    process.env['MIDWAY_LOGGER_DISABLE_COLORS'] = 'true';
  }
  bootstrap = new BaseBootstrap(
    Object.assign(
      {
        runtime: new WorkerRuntime(),
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

export function eventWaitUntil(handler) {
  return extendedEvent => {
    return extendedEvent.waitUntil(
      Promise.resolve(extendedEvent).then(handler)
    );
  };
}

export function eventRespondWith(handler) {
  return fetchEvent => {
    return fetchEvent.respondWith(Promise.resolve(fetchEvent).then(handler));
  };
}
