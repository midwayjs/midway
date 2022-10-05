import { Configuration, App, Catch } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { Application, Context } from '../../../../src';
import { PacketMiddleware } from './middleware/conn.middleware';

@Catch()
export class DefaultFilter {
  async catch(err: Error, ctx: Context) {
    console.log(ctx.readyState);
    return err.message;
  }
}

@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        webSocket: {
          port: 3000
        }
      }
    }
  ]
})
export class AutoConfiguration implements ILifeCycle {

  @App('webSocket')
  app: Application;

  async onReady() {
    this.app.useMiddleware(PacketMiddleware);
    this.app.useFilter(DefaultFilter)
  }
}
