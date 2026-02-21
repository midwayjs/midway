import { defineApi } from '@midwayjs/core/functional';

export const systemApi = defineApi(
  '/system',
  api => ({
    health: api.get('/health').handle(async () => {
      return { ok: true };
    }),
    publicInfo: api
      .get('/public')
      .meta({
        ignoreGlobalPrefix: false,
      })
      .handle(async () => {
        return { scope: 'public' };
      }),
  }),
  {
    ignoreGlobalPrefix: true,
  }
);

