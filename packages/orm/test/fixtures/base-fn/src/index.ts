import { FunctionHandler, FaaSContext } from '@midwayjs/faas';
import { Provide, Inject, Func } from '@midwayjs/decorator';
import { getRepository, InjectEntityModel, useEntityModel } from '../../../../src';
import { User } from './model/user';
import { Repository } from 'typeorm';
import * as assert  from 'assert';
// import { BaseFnHook } from './hook';

@Provide()
export class IndexHandler implements FunctionHandler {
  @Inject()
  ctx: FaaSContext;

  @Inject('orm:getRepository')
  getRepo: getRepository;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  @Func('index.handler')
  async handler() {
    const repo: Repository<User> = this.getRepo(User);
    const u = new User();
    u.name = 'oneuser1';
    const uu = await repo.save(u);
    console.log('user one id = ', uu.id);
    const user = new User();
    user.id = 1;

    const users = await this.userModel.findAndCount(user);

    const userModel = useEntityModel(User);
    const newUsers = await userModel.findAndCount(user);

    assert.deepStrictEqual(users, newUsers);

    const aa = await (this.ctx.requestContext as any).applicationContext.getAsync('baseFnHook');
    assert.equal(aa.bcreate, 1);
    assert.equal(aa.acreate, 1);
    // assert.equal(aa.bclose, 1);
    // assert.equal(aa.aclose, 1);

    return 'hello world' + JSON.stringify(users);
  }
}
