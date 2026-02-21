import { defineApi } from '@midwayjs/core/functional';

export const orderApi = defineApi('/orders', api => ({
  list: api.get('/').handle(async ({ input }) => {
    return {
      status: input.query?.['status'],
      traceId: input.headers?.['x-trace-id'],
    };
  }),
  createItem: api
    .post('/:id/items')
    .handle(async ({ input }) => {
      return {
        id: input.params?.['id'],
        sku: input.body?.['sku'],
      };
    }),
}));

