import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1611657289809_5801';

  // add your config here
  config.middleware = [];

  // socket.io配置
  config.io = {
    init: {}, // passed to engine.io
    namespace: {
      '/ws': {
        connectionMiddleware: [],
        packetMiddleware: [],
      },
    },
  };

  return config;
};
