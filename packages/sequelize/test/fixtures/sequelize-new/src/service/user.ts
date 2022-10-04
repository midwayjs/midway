import { Provide } from '@midwayjs/core';
import { Repository } from 'sequelize-typescript';

import { HelloModel } from '../model/hello';
import { UserModel } from '../model/user';
import { InjectRepository } from '../../../../../src';

@Provide()
export class UserService {
  @InjectRepository(UserModel)
  userRepository: Repository<UserModel>;

  @InjectRepository(HelloModel)
  helloRepository: Repository<HelloModel>;

  async list() {
    const result = await this.userRepository.findAll();
    return result;
  }

  async listWithModel() {
    const result = await UserModel.findAll();
    return result;
  }


  async listHello() {
    const result = await this.helloRepository.findAll();
    return result;
  }

  async add() {
    const result = await this.userRepository.create({
      name: '123',
    });
    return result;
  }

  async delete() {
    await this.userRepository.destroy({
      where: {
        name: '123',
      },
    });
  }
}
