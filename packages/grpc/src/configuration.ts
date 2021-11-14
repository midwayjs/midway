import {
  ApplicationContext,
  Config,
  Configuration,
  Init,
  Inject,
  Logger,
} from '@midwayjs/decorator';
import { MidwayGRPCFramework } from './provider/framework';
import { IMidwayContainer } from '@midwayjs/core';
import { ILogger } from '@midwayjs/logger';
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
  @Inject()
  framework: MidwayGRPCFramework;

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

  async onServerReady() {
    if (this.framework.isEnable()) {
      await this.framework.run();
    }
  }
}
