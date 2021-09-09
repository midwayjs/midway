import { Provide } from '@midwayjs/decorator';
import HelloModel from '../model/hello';
import UserModel from '../model/user';

@Provide()
export class UserService{

  async list(){
    let result = await UserModel.findAll();
    return result;
  }

  async listHello(){
    let result = await HelloModel.findAll();
    return result;
  }

  async add(){
    let result = await UserModel.create({
      name: '123'
    })
    return result;
  }

  async delete(){
    await UserModel.destroy({
      where: {
        name: '123'
      }
    })
  }
}
