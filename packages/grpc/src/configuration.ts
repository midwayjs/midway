import {
  ApplicationContext,
  Config,
  Configuration,
  Init,
  Logger,
  IMidwayContainer,
  ILogger,
} from '@midwayjs/core';
import { setLogger } from '@grpc/grpc-js';
import { GRPCClients } from './comsumer/clients';

@Configuration({
  namespace: 'gRPC',
  importConfigs: [
    {
      default: {
        grpc: {},
        grpcServer: {},
      },
    },
  ],
})
export class GrpcConfiguration {
  @ApplicationContext()
  applicationContext: IMidwayContainer;

  @Config('grpcServer')
  providerConfig;

  @Config('grpc')
  clientConfig;

  @Logger()
  logger: ILogger;

  @Init()
  async init() {
    setLogger(this.logger);
  }

  async onReady() {
    if (this.clientConfig) {
      await this.applicationContext.getAsync(GRPCClients);
    }
  }
}
