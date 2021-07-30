import { App, Configuration } from '@midwayjs/decorator';
import * as orm from '../../../../src';
import { join } from 'path';
import { InjectEntityModel } from '../../../../src';
import { Photo1 } from './model/photo';
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

  @InjectEntityModel(Photo1)
  photoModel: Repository<Photo1>;

  @App()
  app: IMidwayApplication;

  async onReady(container) {
    const u = new Photo1();
    u.size = '100';
    u.title = 'new photo';
    u.description = '';
    const uu = await this.photoModel.save(u);
    console.log('user one id = ', uu.id);
    const p = new Photo1();
    p.id = 1;

    const photoResult = await this.photoModel.findAndCount(p);
    this.app.setAttr('result', 'hello world' + JSON.stringify(photoResult));
  }
}
