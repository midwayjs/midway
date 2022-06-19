import { App, Configuration } from '@midwayjs/decorator';
import * as orm from '../../../../src';
import { join } from 'path';
import { InjectEntityModel } from '../../../../src';
import { OriginUser, User } from './entity/user';
import { Repository } from 'typeorm';
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
  @InjectEntityModel(User)
  userModel: Repository<User>;

  @App()
  app: IMidwayApplication;

  async onReady() {
    const u = new User();
    u.name = 'oneuser1';
    const uu = await this.userModel.save(u);
    console.log('user one id = ', uu.id);
    const user = new User();
    user.id = 1;

    const users = await this.userModel.findAndCount({
      where: user
    });

    const originUser = new OriginUser();
    originUser.firstName = 'Timber';
    originUser.lastName = 'Saw';
    originUser.age = 25;
    await originUser.save();

    const allUsers = await OriginUser.find();

    console.log(allUsers);
    const firstUser = await OriginUser.findOneBy({
      id: 1,
    });
    console.log(firstUser);
    const timber = await OriginUser.findOneBy({
      firstName: 'Timber',
      lastName: 'Saw'
    });

    await timber.remove();

    this.app.setAttr('result', 'hello world' + JSON.stringify(users));
  }
}
