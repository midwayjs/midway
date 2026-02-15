import { defineApi } from '@midwayjs/core/functional';

export const userApi = defineApi('/users', api => ({
  getUser: api
    .get('/:id')
    .meta({ routerName: 'getUser' })
    .handle(async ({ input }) => {
      return {
        id: input.params['id'],
        name: 'harry',
      };
    }),
  createUser: api
    .post('/')
    .meta({ routerName: 'createUser' })
    .handle(async ({ input }) => {
      return {
        id: 'u-created',
        name: input.body['name'],
      };
    }),
}));
