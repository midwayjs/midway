import { Server, ServerCredentials, setLogger, loadPackageDefinition } from '@grpc/grpc-js';
import {
  BaseFramework,
  getClassMetadata,
  IMidwayBootstrapOptions,
  listModule,
  MidwayFrameworkType,
  MidwayRequestContainer,
} from '@midwayjs/core';

import {
  getProviderId,
  MS_PRODUCER_KEY,
  MSProducerType
} from '@midwayjs/decorator';
import {
  IMidwayGRPCApplication, IMidwayGRPConfigurationOptions,
} from './interface';
import { MidwayGRPCContextLogger } from './logger';
import { pascalCase } from 'pascal-case';
import * as camelCase from 'camelcase';

export class MidwayGRPCFramework extends BaseFramework<
  IMidwayGRPCApplication,
  IMidwayGRPConfigurationOptions
  > {
  public app: IMidwayGRPCApplication;
  private server: Server;

  public configure(
    options: IMidwayGRPConfigurationOptions
  ): MidwayGRPCFramework {
    this.configurationOptions = options;
    return this;
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    // set logger to grpc server
    setLogger(this.logger);
    const server: Server = new Server({
      'grpc.max_receive_message_length': -1,
      'grpc.max_send_message_length': -1,
    });

    this.app = server as IMidwayGRPCApplication;
    this.server = server;
  }

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadService();
  }

  protected async loadService() {
    const gRPCModules = listModule(MS_PRODUCER_KEY, (module) => {
      const type = getClassMetadata(MS_PRODUCER_KEY, module);
      return type === MSProducerType.GRPC;
    });

    if (this.configurationOptions.packageDefinition) {
      const definitions = loadPackageDefinition(this.configurationOptions.packageDefinition);
      const protoModule = definitions[this.configurationOptions.package];

      for (const module of gRPCModules) {
        const provideId = getProviderId(module);
        let serviceName = pascalCase(provideId);

        if (protoModule[serviceName]) {
          const protoService = protoModule[serviceName]['service'];
          const serviceInstance = {};
          for (const method in protoService) {
            serviceInstance[method] = async (...args) => {
              const ctx = {} as any;
              ctx.requestContext = new MidwayRequestContainer(ctx, this.getApplicationContext());
              ctx.logger = new MidwayGRPCContextLogger(ctx, this.appLogger);

              const service = await ctx.requestContext.getAsync(gRPCModules);
              return service[camelCase(method)]?.apply(this, args);
            };
          }
          this.server.addService(protoService, serviceInstance);
        } else {
          this.logger.warn(`Proto ${serviceName} not found and not add to gRPC server`, {label: 'midway:gRPC'});
        }
      }
    }
  }

  public async run(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(`127.0.0.1:${this.configurationOptions.port || 6565}`, ServerCredentials.createInsecure(), (err: Error | null, bindPort: number) => {
        if (err) {
          reject(err);
        }

        this.server.start();
        this.logger.info(`Server port = ${bindPort} start success`, {label: 'midway:gRPC'});
        resolve();
      });
    })
  }

  public async beforeStop() {
    this.server.tryShutdown(() => {
      this.logger.info('Server shutdown success', { label: 'midway:gRPC' });
    });
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.MS_GRPC;
  }

  public getApplication(): IMidwayGRPCApplication {
    return this.app;
  }

  public getServer() {
    return this.server;
  }
}
