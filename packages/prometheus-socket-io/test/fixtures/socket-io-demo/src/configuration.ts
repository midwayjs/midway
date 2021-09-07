import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/socketio';
import { ILifeCycle } from '@midwayjs/core';
import * as prometheusSocketIO from '../../../../src';
import * as prometheus from '@midwayjs/prometheus';

@Configuration({
  imports: [prometheus, prometheusSocketIO],
  conflictCheck: true,
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: Application;

  async onReady() {
    this.app.on('connection', socket => {
      console.log(socket.id);
    });
  }
}
