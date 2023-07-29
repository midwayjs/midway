import { Provide } from '@midwayjs/core';
import User from '../model/user';
import { InjectModel } from '../../../../../src';

@Provide()
export class UserService {
  @InjectModel(User)
  User: typeof User;

  async list() {
    return this.User.find();
  }

  async add(options) {
    return this.User.create(options);
  }

  async delete() {
    return this.User.remove({});
  }
}
