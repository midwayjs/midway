import { defineApi, useInject } from '@midwayjs/core/functional';
import { UserService } from '../service/user.service';
import {
  CreateUserInputSchema,
  QueryUserInputSchema,
  UserOutputSchema,
} from '../dto/user.dto';

export const userApi = defineApi('/users', api => ({
  list: api
    .get('/')
    .input(QueryUserInputSchema)
    .handle(async ({ input }) => {
      const service = await useInject(UserService);
      if (input.query?.keyword) {
        return service.searchUsers(input.query.keyword);
      }
      return service.getUsers();
    }),

  create: api
    .post('/')
    .input(CreateUserInputSchema)
    .output(UserOutputSchema)
    .handle(async ({ input }) => {
      const service = await useInject(UserService);
      return service.createUser(
        input.body.name,
        input.body.email,
        input.body.age
      );
    }),
}));
