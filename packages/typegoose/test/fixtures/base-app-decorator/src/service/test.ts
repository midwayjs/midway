import { Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { prop } from '@typegoose/typegoose';
import { Model } from 'mongoose';
import { EntityModel, InjectEntityModel } from '../../../../../src';

@EntityModel()
export class User {

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}

@EntityModel({
  connectionName: 'db2'
})
export class User2 {

  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}

export class User3 {

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
  userModel: Model<User>;

  @InjectEntityModel(User2)
  user2Model: Model<User2>;

  @InjectEntityModel(User3)
  user3Model: Model<User3>;

  async getTest(){
    const { _id: id } = await this.userModel.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User); // an "as" assertion, to have types for all properties
    const user = await this.userModel.findById(id).exec();
    console.log(user)

    const { _id: id2 } = await this.user2Model.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User2); // an "as" assertion, to have types for all properties
    const user2 = await this.user2Model.findById(id2).exec();
    console.log(user2)

    const { _id: id3 } = await this.user3Model.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User3); // an "as" assertion, to have types for all properties
    const user3 = await this.user3Model.findById(id3).exec();
    console.log(user3)
  }
}
