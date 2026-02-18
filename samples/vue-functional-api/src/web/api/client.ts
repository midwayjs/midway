import { createClient } from '@midwayjs/vue';
import { userApi } from '../../server/api/user.api.js';

export const apiBridgeConfig = {
  browserBasePath: '/api',
  serverBasePath: 'http://127.0.0.1:7001/api',
  apiDir: 'src/server/api',
} as const;

export const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: {
      browser: apiBridgeConfig.browserBasePath,
      server: apiBridgeConfig.serverBasePath,
    },
  }
);
