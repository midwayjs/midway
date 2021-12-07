import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { User } from '../entity/user';
import { Repository } from 'typeorm';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  photoModel: Repository<User>;

  async getUser(): Promise<User> {
    return this.photoModel.findOne({
      id: 1,
    });
  }
}
