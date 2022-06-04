import { Inject, Provide } from '@midwayjs/decorator';
import HelloModel from '../model/hello';
import UserModel from '../model/user';

import { SequelizeService } from '../../../../../src/index';

@Provide()
export class UserService {
  @Inject()
  sequelizeService: SequelizeService;

  async list() {
    const result = await UserModel.findAll();
    return result;
  }

  async listHello() {
    const result = await HelloModel.findAll();
    return result;
  }

  async add() {
    const result = await UserModel.create({
      name: '123',
    });
    return result;
  }

  async delete() {
    await UserModel.destroy({
      where: {
        name: '123',
      },
    });
  }

  async create() {
    const t = await this.sequelizeService.transaction();
    try {
      const result = await UserModel.create(
        {
          name: '123',
        },
        {
          transaction: t,
        }
      );
      await t.commit();

      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}
