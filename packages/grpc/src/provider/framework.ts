import {
  Server,
  ServerCredentials,
  setLogger,
  ServerUnaryCall,
  sendUnaryData,
} from '@grpc/grpc-js';
import {
  BaseFramework,
  getClassMetadata,
  IMidwayBootstrapOptions,
  listModule,
  MidwayFrameworkType,
} from '@midwayjs/core';

import {
  DecoratorMetadata,
  getProviderId,
  MS_PROVIDER_KEY,
  MSProviderType,
} from '@midwayjs/decorator';
import {
  IMidwayGRPCApplication,
  IMidwayGRPCContext,
  IMidwayGRPFrameworkOptions,
} from '../interface';
import { pascalCase } from 'pascal-case';
import * as camelCase from 'camelcase';
import { loadProto } from '../util';
import { PackageDefinition } from '@grpc/proto-loader';

export class MidwayGRPCFramework extends BaseFramework<
  IMidwayGRPCApplication,
  IMidwayGRPCContext,
  IMidwayGRPFrameworkOptions
> {
  public app: IMidwayGRPCApplication;
  private server: Server;

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
    // find all code service
    const gRPCModules = listModule(MS_PROVIDER_KEY, module => {
      const info: DecoratorMetadata.ProviderClassMetadata = getClassMetadata(
        MS_PROVIDER_KEY,
        module
      );
      return info.type === MSProviderType.GRPC;
    });

    this.logger.info(
      `Find ${gRPCModules.length} class has gRPC provider decorator`
    );

    // get definition from proto file
    const serviceClassDefinition: Map<string, PackageDefinition> = new Map();
    for (const service of this.configurationOptions.services) {
      const definitions = await loadProto({
        protoPath: service.protoPath,
        loaderOptions: this.configurationOptions.loaderOptions,
      });
      serviceClassDefinition.set(service.package, definitions);
    }

    // register method to service
    for (const module of gRPCModules) {
      const provideId = getProviderId(module);
      const info: DecoratorMetadata.ProviderClassMetadata = getClassMetadata(
        MS_PROVIDER_KEY,
        module
      );
      const classMetadata = info.metadata as DecoratorMetadata.GRPCClassMetadata;
      const serviceName = classMetadata.serviceName || pascalCase(provideId);

      if (serviceClassDefinition.has(classMetadata?.package)) {
        const serviceInstance = {};
        const serviceDefinition: any = serviceClassDefinition.get(
          classMetadata.package
        )[`${classMetadata?.package}.${serviceName}`];

        for (const method in serviceDefinition) {
          serviceInstance[method] = async (
            call: ServerUnaryCall<any, any>,
            callback: sendUnaryData<any>
          ) => {
            const ctx = {
              method,
              call,
              metadata: call.metadata,
              sendMetadata: call.sendMetadata,
            } as any;
            this.app.createAnonymousContext(ctx);
            try {
              const service = await ctx.requestContext.getAsync(module);
              const result = await service[camelCase(method)]?.apply(service, [
                call.request,
              ]);
              callback(null, result);
            } catch (err) {
              callback(err);
            }
          };
        }
        this.server.addService(serviceDefinition, serviceInstance);
        this.logger.info(
          `Proto ${classMetadata?.package}.${serviceName} found and add to gRPC server`
        );
      }
    }
  }

  public async run(): Promise<void> {
    if (this.configurationOptions.url) {
      return new Promise<void>((resolve, reject) => {
        this.server.bindAsync(
          `${this.configurationOptions.url}`,
          ServerCredentials.createInsecure(),
          (err: Error | null, bindPort: number) => {
            if (err) {
              reject(err);
            }

            this.server.start();
            this.logger.info(`Server port = ${bindPort} start success`);
            resolve();
          }
        );
      });
    }
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
    return 'midway:gRPC';
  }
}
