import { defineApi } from '@midwayjs/core/functional';
import { z } from 'zod';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => 'Hello Midway Functional!'),

  greet: api
    .get('/greet')
    .input({
      query: z.object({ name: z.string().optional() }),
    })
    .handle(async ({ input }) => {
      const name = input.query.name || 'guest';
      return `Hello, ${name}!`;
    }),

  getUserById: api
    .get('/user/:id')
    .input({
      params: z.object({ id: z.string() }),
    })
    .handle(async ({ input }) => {
      const { id } = input.params;
      return {
        userId: id,
        name: `user-${id}`,
        email: `user${id}@example.com`,
      };
    }),

  search: api
    .get('/search/:category')
    .input({
      params: z.object({ category: z.string() }),
      query: z.object({
        keyword: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
      }),
    })
    .handle(async ({ input }) => {
      return {
        category: input.params.category,
        keyword: input.query.keyword,
        page: input.query.page,
        results: [],
      };
    }),
}));
