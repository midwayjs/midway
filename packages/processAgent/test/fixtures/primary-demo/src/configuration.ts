import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/koa';
import * as bodyParser from 'koa-bodyparser';
import * as primary from '../../../../src'

@Configuration({
  imports: [primary],
  conflictCheck: true,
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
  @App()
  app: Application;

  async onReady() {
    // bodyparser options see https://github.com/koajs/bodyparser
    this.app.use(bodyParser());
  }
}
