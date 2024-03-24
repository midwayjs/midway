import { MidwayAppInfo } from '@midwayjs/core';

export const isDevelopmentEnvironment = env => {
  return ['local', 'test', 'unittest'].includes(env);
};

export default (appInfo: MidwayAppInfo) => ({
  midwayLogger: {
    default: {
      // for logger v2
      enableConsole: true,
      enableFile: false,
      enableError: false,
      transports: {
        // for logger v3
        console: {
          autoColors: isDevelopmentEnvironment(appInfo.env),
        },
      },
      format: (info: any) => {
        const requestId =
          info.ctx?.['originContext']?.['requestId'] ??
          info.ctx?.['originContext']?.['request_id'] ??
          '';
        return `${new Date().toISOString()} ${requestId} [${info.level}] ${
          info.message
        }`;
      },
    },
  },
});
