import { defineApi, useConfig } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => {
    return {
      name: useConfig('app.name'),
      version: useConfig('app.version'),
      prefix: useConfig('koa.globalPrefix'),
    };
  }),
}));
