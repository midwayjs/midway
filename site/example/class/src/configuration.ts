import { Configuration, MainApp } from '@midwayjs/core';
import { Application } from '@midwayjs/koa';
import * as bodyParser from 'koa-bodyparser';
import * as orm from '@midwayjs/orm';
import { join } from 'path';

@Configuration({
  conflictCheck: true,
  imports: [
    orm                                                         // 加载 orm 组件
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerLifeCycle {
  @MainApp()
  app: Application;

  async onReady() {
    // bodyparser options see https://github.com/koajs/bodyparser
    this.app.use(bodyParser());
  }
}
