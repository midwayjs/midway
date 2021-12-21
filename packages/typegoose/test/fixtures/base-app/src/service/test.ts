import { Provide, Scope, ScopeEnum, Init } from "@midwayjs/decorator";
import { ReturnModelType, prop } from '@typegoose/typegoose';
import { EntityModel, InjectEntityModel } from '../../../../../src';
// import { Model } from 'mongoose';

@EntityModel()
export class User {

  static c() {}

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class TestService {

  @InjectEntityModel(User)
  userModel: ReturnModelType<typeof User>

  @Init()
  init() {
    // this.userModel =
    console.log(this.userModel.c);
  }

  async getTest(){
    const { _id: id } = await this.userModel.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User); // an "as" assertion, to have types for all properties
    const user = await this.userModel.findById(id).exec();
    console.log(user)
  }
}
