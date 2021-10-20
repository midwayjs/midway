import { Provide, Scope, ScopeEnum, Init } from "@midwayjs/decorator";
import { getModelForClass, prop } from '@typegoose/typegoose';
import { Model } from 'mongoose';

class User {

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class TestService{

  userModel: Model<User>;

  @Init()
  init() {
    this.userModel = getModelForClass(User);
  }

  async getTest(){
    const { _id: id } = await this.userModel.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User); // an "as" assertion, to have types for all properties
    const user = await this.userModel.findById(id).exec();
    console.log(user)
  }
}
