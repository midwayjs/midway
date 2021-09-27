import { App, Configuration, Inject } from '@midwayjs/decorator';
import * as orm from '../../../../src';
import { join } from 'path';
import { getRepository, getCustomRepository, InjectEntityModel, useEntityModel } from '../../../../src';
import { User } from './model/user';
import { EntityRepository, Repository } from 'typeorm';
import * as assert from 'assert';
import { IMidwayApplication } from '@midwayjs/core';

@EntityRepository(User)
class UserRepository extends Repository<User> {
  findMyPost() {
    return this.findOne();
  }

  createSave(u: any) {
    return this.manager.save(u);
  }
}

@Configuration({
  imports: [
    orm
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {

  @Inject('orm:getRepository')
  getRepo: getRepository;

  @Inject('orm:getCustomRepository')
  getCustomRepo: getCustomRepository;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  @App()
  app: IMidwayApplication;

  async onReady(container) {
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

    const newUser = this.getCustomRepo(UserRepository);
    const ttu = (newUser as any).create(); 
    ttu.name = 'ttt' + Date.now();
    await (newUser as any).createSave(ttu);
    const ret = await newUser.find({ name: ttu.name});
    assert.ok(ret.length > 0);

    const aa = await container.getAsync('baseFnHook');
    assert.equal(aa.bcreate, 1);
    assert.equal(aa.acreate, 1);
    // assert.equal(aa.bclose, 1);
    // assert.equal(aa.aclose, 1);

    this.app.setAttr('result', 'hello world' + JSON.stringify(users));
  }
}
