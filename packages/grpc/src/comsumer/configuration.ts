import { Configuration, Logger } from '@midwayjs/decorator';
import { setLogger } from '@grpc/grpc-js';
import { ILogger } from '@midwayjs/logger';

@Configuration({
  namespace: 'grpc'
})
export class AutoConfiguration {

  @Logger('coreLogger')
  logger: ILogger;

  async onReady(container) {
    setLogger(this.logger);
    await container.getAsync('grpc:clients');
  }
}
