import { defineApi } from '@midwayjs/core/functional';

export const healthApi = defineApi('/health', api => ({
  ping: api
    .get('/ping')
    .meta({ routerName: 'healthPing' })
    .handle(async () => {
      return {
        ok: true,
        now: new Date().toISOString(),
      };
    }),

  echo: api
    .post('/echo')
    .meta({ routerName: 'healthEcho' })
    .handle(async ({ input }) => {
      return {
        body: input.body ?? null,
      };
    }),
}));
