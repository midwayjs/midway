import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => {
    return {
      message: 'Hello Midway Functional!',
    };
  }),
}));
