import { App, Configuration, MidwayFrameworkType } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application as SocketApplication } from '@midwayjs/socketio';
import { join } from 'path';
import * as prometheusSocketIO from '../../../../src';
import * as prometheus from '@midwayjs/prometheus';
import * as Web from '@midwayjs/web';
import * as SocketIO from '@midwayjs/socketio';

@Configuration({
  imports: [
    Web,
    SocketIO,
    prometheus,
    prometheusSocketIO
  ],
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
})
export class ContainerLifeCycle implements ILifeCycle {
  @App(MidwayFrameworkType.WS_IO)
  socketApp: SocketApplication;

  async onReady() {
    this.socketApp.on('connection', socket => {
      console.log(socket.id);
    });
  }
}
