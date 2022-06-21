import { Provide } from '@midwayjs/decorator';
import { HelloModel } from '../model/hello';
import { UserModel } from '../model/user';
import { InjectRepository } from '../../../../../src';
import { Repository } from 'sequelize-typescript';

@Provide()
export class UserService {

  @InjectRepository(UserModel)
  userRepository: Repository<UserModel>;

  @InjectRepository(HelloModel)
  helloRepository: Repository<HelloModel>;

  async list() {
    let result = await this.userRepository.findAll();
    return result;
  }

  async listHello() {
    let result = await this.helloRepository.findAll();
    return result;
  }

  async add() {
    let result = await this.userRepository.create({
      name: '123'
    });
    return result;
  }

  async delete() {
    await this.userRepository.destroy({
      where: {
        name: '123'
      }
    });
  }
}
