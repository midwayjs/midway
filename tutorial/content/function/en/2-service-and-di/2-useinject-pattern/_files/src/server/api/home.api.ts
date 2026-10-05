import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => {
    return {
      message: 'Dependency injection with useInject is enabled.',
      apis: {
        users: '/api/users',
        userById: '/api/users/:id',
        search: '/api/users/search?keyword=...'
      }
    };
  }),
}));
