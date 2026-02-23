import { defineApi, useInject } from '@midwayjs/core/functional';
import { UserService } from '../service/user.service';

export const userApi = defineApi('/users', api => ({
  list: api.get('/').handle(async () => {
    const userService = await useInject(UserService);
    const users = await userService.getUsers();
    return { success: true, data: users };
  }),

  getOne: api.get('/:id').handle(async ({ input }) => {
    const userService = await useInject(UserService);
    const user = await userService.getUserById(String(input.params?.id || ''));

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    return { success: true, data: user };
  }),

  search: api.get('/search').handle(async ({ input }) => {
    const userService = await useInject(UserService);
    const users = await userService.searchUsers(String(input.query?.keyword || ''));
    return { success: true, data: users, count: users.length };
  }),
}));
