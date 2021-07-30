import { App, Configuration, Inject } from '@midwayjs/decorator';
import * as orm from '../../../../src';
import { join } from 'path';
import { getRepository, InjectEntityModel, useEntityModel } from '../../../../src';
import { User2 } from './model/user';
import { Repository } from 'typeorm';
import * as assert from 'assert';
import { IMidwayApplication } from '@midwayjs/core';

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

  @InjectEntityModel(User2)
  userModel: Repository<User2>;

  @App()
  app: IMidwayApplication;

  async onReady(container) {
    const repo: Repository<User2> = this.getRepo(User2);
    const u = new User2();
    u.name = 'oneuser1';
    const uu = await repo.save(u);
    console.log('user one id = ', uu.id);
    const user = new User2();
    user.id = 1;

    const users = await this.userModel.findAndCount(user);

    const userModel = useEntityModel(User2);
    const newUsers = await userModel.findAndCount(user);

    assert.deepStrictEqual(users, newUsers);

    const aa = await container.getAsync('baseFnHook');
    assert.equal(aa.bcreate, 1);
    assert.equal(aa.acreate, 1);
    // assert.equal(aa.bclose, 1);
    // assert.equal(aa.aclose, 1);

    this.app.setAttr('result', 'hello world' + JSON.stringify(users));
  }
}
