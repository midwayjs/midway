import { defineApi, useInject, useContext } from '@midwayjs/core/functional';
import { UserService } from '../service/user.service';

export const userApi = defineApi('/users', api => ({
  list: api.get('/').handle(async () => {
    const service = await useInject(UserService);
    return { success: true, data: await service.getUsers() };
  }),

  getOne: api.get('/:id').handle(async ({ input }) => {
    const service = await useInject(UserService);
    const user = await service.getUserById(String(input.params?.id || ''));
    return user
      ? { success: true, data: user }
      : { success: false, message: 'User not found' };
  }),

  create: api.post('/').handle(async ({ input }) => {
    const service = await useInject(UserService);
    const ctx = useContext();
    ctx.status = 201;
    const user = await service.createUser(
      String(input.body?.name || ''),
      String(input.body?.email || '')
    );
    return { success: true, message: 'User created', data: user };
  }),

  update: api.put('/:id').handle(async ({ input }) => {
    const service = await useInject(UserService);
    const user = await service.updateUser(String(input.params?.id || ''), {
      name: input.body?.name,
      email: input.body?.email,
    });

    return user
      ? { success: true, message: 'User updated', data: user }
      : { success: false, message: 'User not found' };
  }),

  remove: api.delete('/:id').handle(async ({ input }) => {
    const service = await useInject(UserService);
    const ok = await service.deleteUser(String(input.params?.id || ''));
    return ok
      ? { success: true, message: 'User deleted' }
      : { success: false, message: 'User not found' };
  }),

  search: api.get('/search').handle(async ({ input }) => {
    const service = await useInject(UserService);
    const users = await service.searchUsers(String(input.query?.keyword || ''));
    return { success: true, data: users, count: users.length };
  }),
}));
