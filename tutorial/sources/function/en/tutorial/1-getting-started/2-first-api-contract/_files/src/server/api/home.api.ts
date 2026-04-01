import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => {
    return 'Hello Midway Functional!';
  }),

  info: api.get('/info').handle(async () => {
    return {
      name: 'Midway Functional API',
      version: '4.0.0-beta.13',
    };
  }),
}));
