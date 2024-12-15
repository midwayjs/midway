import { Configuration, MainApp } from '@midwayjs/core';
import { Application } from '@midwayjs/koa';
import * as bodyParser from 'koa-bodyparser';
import * as primary from '../../../../src'

@Configuration({
  imports: [primary],
  importConfigs: [
    {
      default: {
        koa: {
          keys: ['123']
        }
      }
    }
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
