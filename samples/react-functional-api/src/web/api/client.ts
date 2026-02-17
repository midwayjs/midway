import * as MidwayReact from '@midwayjs/react';
import { userApi } from '../../server/api';

export const apiBridgeConfig = {
  basePath: '/api',
  apiDir: 'src/server/api',
} as const;

const { createClient } = MidwayReact;

export const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: apiBridgeConfig.basePath,
  }
);
