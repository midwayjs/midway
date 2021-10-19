import { Provide, Scope, ScopeEnum } from "@midwayjs/decorator";
import { prop, ReturnModelType } from '@typegoose/typegoose';
import { EntityModel, InjectEntityModel } from '../../../../../src';

@EntityModel()
class User {

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}

@EntityModel({
  connectionName: 'db2'
})
class User2 {

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class TestService{

  @InjectEntityModel(User)
  userModel: ReturnModelType<typeof User>;

  @InjectEntityModel(User2, 'db2')
  user2Model: ReturnModelType<typeof User2>;

  async getTest(){
    const { _id: id } = await this.userModel.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User); // an "as" assertion, to have types for all properties
    const user = await this.userModel.findById(id).exec();
    console.log(user)

    const { _id: id2 } = await this.user2Model.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User2); // an "as" assertion, to have types for all properties
    const user2 = await this.user2Model.findById(id2).exec();
    console.log(user2)
  }
}
