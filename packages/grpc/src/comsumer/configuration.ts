import { Config, Configuration, Logger } from '@midwayjs/decorator';
import { IMidwayGRPCConfigOptions } from '../interface';
import { setLogger, loadPackageDefinition } from '@grpc/grpc-js';
import { ILogger } from '@midwayjs/logger';

@Configuration({
  namespace: 'grpc'
})
export class AutoConfiguration {

  @Config()
  grpcConfig: IMidwayGRPCConfigOptions;

  @Logger('coreLogger')
  logger: ILogger;

  async onReady(container) {
    setLogger(this.logger);
    for(const client of this.grpcConfig.clients) {
      if (client.packageDefinition) {
        const definitions = loadPackageDefinition(client.packageDefinition);
        container.registerObject(`definitions:${client.package}`, definitions);
      }
    }

  }
}
