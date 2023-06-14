import { Provide } from '@midwayjs/core';
import User from '../model/user';
import { InjectModel } from '../../../../../src';

@Provide()
export class UserService {
  @InjectModel()
  User: typeof User;

  async list() {
    const result = await this.User.find();
    return result;
  }

  async add(options) {
    return await this.User.create(options);
  }

  async delete() {
    return await this.User.remove({});
  }
}
