import { Configuration, App } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '../../../../src';
import { ConnectionMiddleware, PacketMiddleware } from './middleware/conn.middleware';


@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        socketIO: {
          port: 3000
        }
      }
    }
  ]
})
export class AutoConfiguration implements ILifeCycle {

  @App('socketIO')
  app: Application;

  async onReady() {
    this.app.useConnectionMiddleware(ConnectionMiddleware);
    this.app.useMiddleware(PacketMiddleware);
  }
}
