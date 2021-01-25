import { Provide, Scope, ScopeEnum } from "@midwayjs/decorator";
import { getModelForClass, prop } from "../../../../../src";

class User {
  @prop()
  public name?: string;

  @prop({ type: () => [String] })
  public jobs?: string[];
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class TestService{
  async getTest(){
    const UserModel = getModelForClass(User);
    const { _id: id } = await UserModel.create({ name: 'JohnDoe', jobs: ['Cleaner'] } as User); // an "as" assertion, to have types for all properties
    const user = await UserModel.findById(id).exec();
    console.log(user)
  }
}
