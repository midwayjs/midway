import { Configuration, Logger } from '@midwayjs/decorator';
import { setLogger } from '@grpc/grpc-js';
import { ILogger } from '@midwayjs/logger';
import { join } from 'path';

@Configuration({
  namespace: 'grpc',
  importConfigs: [
    join(__dirname, 'config.default'),
  ]
})
export class AutoConfiguration {

  @Logger()
  logger: ILogger;

  async onReady(container) {
    setLogger(this.logger);
    await container.getAsync('grpc:clients');
  }
}
