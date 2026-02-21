import { defineApi } from '@midwayjs/core/functional';

export const profileApi = defineApi(
  '/profiles',
  api => ({
    getProfile: api
      .get('/:id')
      .handle(async ({ input }) => {
        return {
          id: input.params?.['id'],
          locale: input.headers?.['x-locale'] || 'en-US',
        };
      }),
  }),
  {
    version: '7',
    versionType: 'HEADER',
    versionPrefix: 'v',
  }
);

