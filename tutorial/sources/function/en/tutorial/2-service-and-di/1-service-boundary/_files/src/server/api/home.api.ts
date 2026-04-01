import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => {
    return {
      message: 'UserService is ready. Next step: inject it in API handlers.',
    };
  }),
}));
