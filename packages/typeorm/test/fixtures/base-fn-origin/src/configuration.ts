import { App, Configuration } from '@midwayjs/core';
import * as orm from '../../../../src';
import { join } from 'path';
import { InjectDataSource, InjectEntityModel } from '../../../../src';
import { OriginUser, User } from './entity/user';
import { DataSource, Repository } from 'typeorm';
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

  @InjectDataSource()
  defaultDataSource: DataSource;

  @InjectDataSource('default')
  namedDataSource: DataSource;

  @App()
  app: IMidwayApplication;

  async onReady() {

    expect(this.defaultDataSource).toBeDefined();
    expect(this.defaultDataSource).toEqual(this.namedDataSource);

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
