import { Configuration, App } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { createRedisAdapter, Application } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        socketIO: {
          port: 3000,
          adapter: createRedisAdapter({ host: '127.0.0.1', port: 6379}),
        }
      }
    }
  ]
})
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: Application;

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
