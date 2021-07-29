import { App, Configuration } from '@midwayjs/decorator';
import * as orm from '../../../../src';
import { join } from 'path';
import { InjectEntityModel } from '../../../../src';
import { Photo } from './model/photo';
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

  @InjectEntityModel(Photo)
  photoModel: Repository<Photo>;

  @App()
  app: IMidwayApplication;

  async onReady(container) {
    const u = new Photo();
    u.size = '100';
    u.title = 'new photo';
    u.description = '';
    const uu = await this.photoModel.save(u);
    console.log('user one id = ', uu.id);
    const p = new Photo();
    p.id = 1;

    const photoResult = await this.photoModel.findAndCount(p);
    this.app.setAttr('result', 'hello world' + JSON.stringify(photoResult));
  }
}
