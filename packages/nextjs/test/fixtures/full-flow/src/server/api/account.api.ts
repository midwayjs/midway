import { defineApi } from '@midwayjs/core/functional';

export const accountApi = defineApi(
  '/accounts',
  api => ({
    getAccount: api
      .get('/:id')
      .meta({ routerName: 'getAccount' })
      .handle(async ({ input }) => {
        return {
          id: input.params?.['id'],
          role: 'member',
        };
      }),
  }),
  {
    version: '2',
    versionType: 'URI',
    versionPrefix: 'v',
  }
);

