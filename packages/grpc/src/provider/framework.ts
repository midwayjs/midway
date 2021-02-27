import {
  sendUnaryData,
  Server,
  ServerCredentials,
  ServerUnaryCall,
  setLogger,
} from '@grpc/grpc-js';
import {
  BaseFramework,
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
} from '@midwayjs/core';

import {
  DecoratorMetadata,
  getClassMetadata,
  getPropertyMetadata,
  getProviderId,
  GrpcStreamTypeEnum,
  listModule,
  MS_GRPC_METHOD_KEY,
  MS_PROVIDER_KEY,
  MSProviderType,
} from '@midwayjs/decorator';
import {
  IMidwayGRPCApplication,
  Context,
  IMidwayGRPFrameworkOptions,
} from '../interface';
import { pascalCase } from 'pascal-case';
import * as camelCase from 'camelcase';
import { loadProto } from '../util';
import { PackageDefinition } from '@grpc/proto-loader';

export class MidwayGRPCFramework extends BaseFramework<
  IMidwayGRPCApplication,
  Context,
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
            callback?: sendUnaryData<any>
          ) => {
            // merge ctx and call
            const ctx = call as any;
            ctx.method = method;
            this.app.createAnonymousContext(ctx);

            // get service from request container
            const service = await ctx.requestContext.getAsync(module);

            // get metadata from decorator
            const grpcMethodData: {
              methodName: string;
              type: GrpcStreamTypeEnum;
              onEnd: string;
            } = getPropertyMetadata(
              MS_GRPC_METHOD_KEY,
              module,
              camelCase(method)
            );

            if (
              grpcMethodData.type === GrpcStreamTypeEnum.DUPLEX ||
              grpcMethodData.type === GrpcStreamTypeEnum.READABLE
            ) {
              // listen data and trigger binding method
              call.on('data', async data => {
                await this.handleContextMethod({
                  service,
                  ctx,
                  callback,
                  data,
                  grpcMethodData,
                });
              });
              call.on('end', async () => {
                if (grpcMethodData.onEnd) {
                  try {
                    const endResult = await service[grpcMethodData.onEnd]();
                    callback && callback(null, endResult);
                  } catch (err) {
                    callback && callback(err);
                  }
                }
              });
            } else {
              // writable and base type will be got data directly
              await this.handleContextMethod({
                service,
                ctx,
                callback,
                data: call.request,
                grpcMethodData,
              });
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

  protected async handleContextMethod(options: {
    service;
    ctx: Context;
    callback;
    data: any;
    grpcMethodData: {
      methodName: string;
      type: GrpcStreamTypeEnum;
      onEnd: string;
    };
  }) {
    let result;
    const { service, ctx, callback, data, grpcMethodData } = options;

    try {
      result = await service[camelCase(ctx.method)]?.call(service, data);
      if (grpcMethodData.type === GrpcStreamTypeEnum.BASE) {
        // base 才返回，其他的要等服务端自己 end，或者等客户端 end 事件才结束
        callback && callback(null, result);
      }
    } catch (err) {
      callback && callback(err);
    }
  }

  public async run(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server.bindAsync(
        `${this.configurationOptions.url || 'localhost:6565'}`,
        this.configurationOptions.credentials ||
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

  public async beforeStop() {
    await new Promise<void>(resolve => {
      const shutdownTimer = setTimeout(() => {
        this.server.forceShutdown();
        resolve();
      }, 2000);

      this.server.tryShutdown(err => {
        clearTimeout(shutdownTimer);
        if (err) {
          this.logger.error(
            'Server shutdown error and will invoke force shutdown, err=' +
              err.message
          );
          this.server.forceShutdown();
          resolve();
        } else {
          this.logger.info('Server shutdown success');
          resolve();
        }
      });
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
