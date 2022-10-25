import { Configuration, App, Logger } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class ContainerConfiguration {

  @App()
  app;

  @Logger()
  logger;

  async onServerReady() {
    this.app.getFramework().getServer().on('timeout', socket => {
      const req = socket.parser.incoming;
      if (req && socket._httpMessage) {
        this.logger.warn('[http_server] A request `%s %s` timeout with client (%s:%d)', req.method, req.url, socket.remoteAddress, socket.remotePort);
      }
      socket.destroy();
    });
  }
}
