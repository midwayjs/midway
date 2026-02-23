import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => 'Hello Midway Functional!'),

  greet: api.get('/greet').handle(async ({ input }) => {
    const name = String(input.query?.name || 'guest');
    return `Hello, ${name}!`;
  }),

  getUserById: api.get('/user/:id').handle(async ({ input }) => {
    const id = String(input.params?.id || '');
    return {
      userId: id,
      name: `user-${id}`,
      email: `user${id}@example.com`,
    };
  }),

  search: api.get('/search/:category').handle(async ({ input }) => {
    return {
      category: input.params?.category,
      keyword: input.query?.keyword,
      page: Number(input.query?.page || 1),
      results: [],
    };
  }),

  calculate: api.get('/calc/:operation').handle(async ({ input }) => {
    const operation = String(input.params?.operation || '');
    const a = Number(input.query?.a || 0);
    const b = Number(input.query?.b || 0);

    switch (operation) {
      case 'add':
        return { operation, a, b, result: a + b };
      case 'subtract':
        return { operation, a, b, result: a - b };
      case 'multiply':
        return { operation, a, b, result: a * b };
      case 'divide':
        return { operation, a, b, result: b === 0 ? null : a / b };
      default:
        return { error: 'unsupported operation' };
    }
  }),
}));
