import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwaySocketIOApplication } from '../../../../src';


@Configuration()
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: IMidwaySocketIOApplication;

  async onReady() {
    this.app.on('connection', (socket) => {
      console.log('global connection', socket.id);

      this.app.on('my', () => {
        console.log('got my event');
      });

      this.app.on('disconnect', () => {
        console.log('closing socket server');
      });
    });
  }
}
