import { Server, ServerCredentials, setLogger, ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
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
  MS_PROVIDER_KEY,
  MSProviderType
} from '@midwayjs/decorator';
import {
  IMidwayGRPCApplication, IMidwayGRPFrameworkOptions,
} from '../interface';
import { MidwayGRPCContextLogger } from './logger';
import { pascalCase } from 'pascal-case';
import * as camelCase from 'camelcase';
import { loadProto } from '../util';

export class MidwayGRPCFramework extends BaseFramework<
  IMidwayGRPCApplication,
  IMidwayGRPFrameworkOptions
  > {
  public app: IMidwayGRPCApplication;
  private server: Server;

  public configure(
    options: IMidwayGRPFrameworkOptions
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
    const gRPCModules = listModule(MS_PROVIDER_KEY, (module) => {
      const type = getClassMetadata(MS_PROVIDER_KEY, module);
      return type === MSProviderType.GRPC;
    });

    const definitions = await loadProto(this.configurationOptions);

    for (const module of gRPCModules) {
      const provideId = getProviderId(module);
      let serviceName = pascalCase(provideId);
      const serviceDefinition: any = definitions[`${this.configurationOptions.package}.${serviceName}`];

      if (serviceDefinition) {
        const serviceInstance = {};
        for (const method in serviceDefinition) {
          serviceInstance[method] = async (call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) => {
            const ctx = { metadata: call.metadata} as any;
            ctx.requestContext = new MidwayRequestContainer(ctx, this.getApplicationContext());
            ctx.logger = new MidwayGRPCContextLogger(ctx, this.appLogger);

            try {
              const service = await ctx.requestContext.getAsync(module);
              const result = await service[camelCase(method)]?.apply(this, [call.request]);
              callback(null, result);
            } catch (err) {
              callback(err);
            }
          };
        }
        this.server.addService(serviceDefinition, serviceInstance);
        this.logger.info(`Proto ${this.configurationOptions.package}.${serviceName} found and add to gRPC server`);
      }
    }
  }

  public async run(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server.bindAsync(`127.0.0.1:${this.configurationOptions.port || 6565}`, ServerCredentials.createInsecure(), (err: Error | null, bindPort: number) => {
        if (err) {
          reject(err);
        }

        this.server.start();
        this.logger.info(`Server port = ${bindPort} start success`);
        resolve();
      });
    });
  }

  public async beforeStop() {
    this.server.tryShutdown(() => {
      this.logger.info('Server shutdown success');
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

  public getFrameworkName() {
    return 'midway:gRPC'
  }
}
