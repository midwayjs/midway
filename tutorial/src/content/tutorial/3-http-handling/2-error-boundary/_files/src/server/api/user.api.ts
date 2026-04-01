import { MidwayHttpError } from '@midwayjs/core';
import { defineApi, useInject } from '@midwayjs/core/functional';
import { UserService } from '../service/user.service';
import { ValidationError, NotFoundError } from '../error/custom.error';

export const userApi = defineApi('/users', api => ({
  create: api.post('/').handle(async ({ input }) => {
    const name = String(input.body?.name || '');
    const email = String(input.body?.email || '');

    if (!name || !email) {
      throw new ValidationError('name and email are required');
    }

    if (!email.includes('@')) {
      throw new MidwayHttpError('invalid email format', 400);
    }

    const service = await useInject(UserService);
    return {
      success: true,
      data: await service.createUser(name, email),
    };
  }),

  getOne: api.get('/:id').handle(async ({ input }) => {
    const id = String(input.params?.id || '');
    if (!id) {
      throw new ValidationError('id is required');
    }

    const service = await useInject(UserService);
    const user = await service.getUserById(id);

    if (!user) {
      throw new NotFoundError('user');
    }

    return {
      success: true,
      data: user,
    };
  }),
}));
