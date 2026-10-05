import { defineApi, useInject, useContext } from '@midwayjs/core/functional';
import { z } from 'zod';
import { UserService } from '../service/user.service';

const IdParams = z.object({ id: z.string() });

export const userApi = defineApi('/users', api => ({
  list: api.get('/').handle(async () => {
    const service = await useInject(UserService);
    return { success: true, data: await service.getUsers() };
  }),

  getOne: api
    .get('/:id')
    .input({ params: IdParams })
    .handle(async ({ input }) => {
      const service = await useInject(UserService);
      const user = await service.getUserById(input.params.id);
      return user
        ? { success: true, data: user }
        : { success: false, message: 'User not found' };
    }),

  create: api
    .post('/')
    .input({
      body: z.object({ name: z.string(), email: z.string() }),
    })
    .handle(async ({ input }) => {
      const service = await useInject(UserService);
      const ctx = useContext();
      ctx.status = 201;
      const user = await service.createUser(input.body.name, input.body.email);
      return { success: true, message: 'User created', data: user };
    }),

  update: api
    .put('/:id')
    .input({
      params: IdParams,
      body: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
      }),
    })
    .handle(async ({ input }) => {
      const service = await useInject(UserService);
      const user = await service.updateUser(input.params.id, input.body);

      return user
        ? { success: true, message: 'User updated', data: user }
        : { success: false, message: 'User not found' };
    }),

  remove: api
    .delete('/:id')
    .input({ params: IdParams })
    .handle(async ({ input }) => {
      const service = await useInject(UserService);
      const ok = await service.deleteUser(input.params.id);
      return ok
        ? { success: true, message: 'User deleted' }
        : { success: false, message: 'User not found' };
    }),

  search: api
    .get('/search')
    .input({ query: z.object({ keyword: z.string().default('') }) })
    .handle(async ({ input }) => {
      const service = await useInject(UserService);
      const users = await service.searchUsers(input.query.keyword);
      return { success: true, data: users, count: users.length };
    }),
}));
