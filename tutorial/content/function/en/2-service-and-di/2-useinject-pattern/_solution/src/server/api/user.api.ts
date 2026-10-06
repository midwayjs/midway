import { defineApi, useInject } from '@midwayjs/core/functional';
import { z } from 'zod';
import { UserService } from '../service/user.service';

export const userApi = defineApi('/users', api => ({
  list: api.get('/').handle(async () => {
    const userService = await useInject(UserService);
    const users = await userService.getUsers();
    return { success: true, data: users };
  }),

  search: api
    .get('/search')
    .input({ query: z.object({ keyword: z.string().default('') }) })
    .handle(async ({ input }) => {
      const userService = await useInject(UserService);
      const users = await userService.searchUsers(input.query.keyword);
      return { success: true, data: users, count: users.length };
    }),

  getOne: api
    .get('/:id')
    .input({ params: z.object({ id: z.string() }) })
    .handle(async ({ input }) => {
      const userService = await useInject(UserService);
      const user = await userService.getUserById(input.params.id);

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      return { success: true, data: user };
    }),
}));
