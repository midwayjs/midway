import { MidwayHttpError } from '@midwayjs/core';
import { defineApi, useInject } from '@midwayjs/core/functional';
import { z } from 'zod';
import { UserService } from '../service/user.service';
import { ValidationError, NotFoundError } from '../error/custom.error';

export const userApi = defineApi('/users', api => ({
  create: api
    .post('/')
    // 字段都设为可选，交给下面的业务代码抛出自定义错误
    .input({
      body: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
      }),
    })
    .handle(async ({ input }) => {
      const { name, email } = input.body;

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

  getOne: api
    .get('/:id')
    .input({ params: z.object({ id: z.string() }) })
    .handle(async ({ input }) => {
      const service = await useInject(UserService);
      const user = await service.getUserById(input.params.id);

      if (!user) {
        throw new NotFoundError('user');
      }

      return {
        success: true,
        data: user,
      };
    }),
}));
