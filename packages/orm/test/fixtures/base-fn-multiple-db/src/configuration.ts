import { IMidwayApplication } from '@midwayjs/core';
import { App, Configuration, Inject } from '@midwayjs/decorator';
import * as assert from 'assert';
import { join } from 'path';
import { getConnection, Repository } from 'typeorm';
import * as orm from '../../../../src';
import { getRepository, InjectEntityModel } from '../../../../src';
import { OnlyTestLoadLog } from './model/onlyTestLoadLog';
import { User } from './model/user';

@Configuration({
  imports: [orm],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerConfiguration {
  @Inject('orm:getRepository')
  getRepo: getRepository;

  @InjectEntityModel(User, 'test')
  testUserModel: Repository<User>;

  @InjectEntityModel(User)
  defaultUserModel: Repository<User>;

  @App()
  app: IMidwayApplication;

  async onReady(container) {
    const u = new User();
    u.name = 'oneuser1';

    const uu = await this.defaultUserModel.save(u);

    console.log('user one id = ', uu.id);
    const user = new User();
    user.id = 1;

    const users = await this.defaultUserModel.findAndCount(user);
    assert(users[0][0]['name'] === 'oneuser1');

    const result = await this.testUserModel.findOne(user);
    assert(!result);

    const aa = await container.getAsync('baseFnMultipleHook');
    assert.equal(aa.bcreate, 1);
    assert.equal(aa.acreate, 1);

    const defaultConn = getConnection('default');
    const testConn = getConnection('test');

    assert(defaultConn.options.entities.includes(OnlyTestLoadLog) === false);
    assert(testConn.options.entities.includes(OnlyTestLoadLog) === true);

    this.app.setAttr('result', 'hello world' + JSON.stringify(users));
  }
}
