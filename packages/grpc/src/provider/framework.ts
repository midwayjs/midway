import {
  sendUnaryData,
  Server,
  ServerCredentials,
  setLogger,
  UntypedServiceImplementation,
  UntypedHandleCall,
  ServerUnaryCall,
} from '@grpc/grpc-js';
import {
  Config,
  Framework,
  getClassMetadata,
  getPropertyMetadata,
  getProviderName,
  GRPCMetadata,
  GrpcStreamTypeEnum,
  listModule,
  MS_GRPC_METHOD_KEY,
  MS_PROVIDER_KEY,
  MSProviderType,
  Utils,
  BaseFramework,
  IMidwayBootstrapOptions,
  MidwayCommonError,
  MidwayFrameworkType,
  MidwayInvokeForbiddenError,
} from '@midwayjs/core';
import {
  Context,
  IMidwayGRPCApplication,
  IMidwayGRPFrameworkOptions,
} from '../interface';
import { loadProto } from '../util';
import { PackageDefinition } from '@grpc/proto-loader';

@Framework()
export class MidwayGRPCFramework extends BaseFramework<
  IMidwayGRPCApplication,
  Context,
  IMidwayGRPFrameworkOptions
> {
  public app: IMidwayGRPCApplication;
  private server: Server;

  @Config()
  providerConfig;

  configure() {
    return this.configService.getConfiguration('grpcServer');
  }

  isEnable(): boolean {
    return this.configurationOptions.services?.length > 0;
  }

  async applicationInitialize(options: Partial<IMidwayBootstrapOptions>) {
    // set logger to grpc server
    setLogger(this.logger);
    const server: Server = new Server(
      Object.assign(
        {
          'grpc.max_receive_message_length': -1,
          'grpc.max_send_message_length': -1,
        },
        this.configurationOptions.serverOptions || {}
      )
    );

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
      const info: GRPCMetadata.ProviderMetadata = getClassMetadata(
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
    for (const service of this.configurationOptions.services ?? []) {
      const definitions = await loadProto({
        protoPath: service.protoPath,
        loaderOptions: this.configurationOptions.loaderOptions,
      });
      serviceClassDefinition.set(service.package, definitions);
    }

    // register method to service
    for (const module of gRPCModules) {
      const providerName = getProviderName(module);
      const info: GRPCMetadata.ProviderMetadata = getClassMetadata(
        MS_PROVIDER_KEY,
        module
      );
      const classMetadata = info.metadata;
      const serviceName =
        classMetadata.serviceName || Utils.pascalCase(providerName);

      if (serviceClassDefinition.has(classMetadata?.package)) {
        const serviceInstance = {} as UntypedServiceImplementation;
        const serviceDefinition: any = serviceClassDefinition.get(
          classMetadata.package
        )[`${classMetadata?.package}.${serviceName}`];

        if (!serviceDefinition) {
          throw new MidwayCommonError(
            `${classMetadata?.package}.${serviceName} definition not found and init fail`
          );
        }

        for (const method in serviceDefinition) {
          serviceInstance[method] = async (
            call: Parameters<UntypedHandleCall>[0],
            callback?: sendUnaryData<any>
          ) => {
            // merge ctx and call
            const ctx = call as Context;
            ctx.method = method;
            this.app.createAnonymousContext(ctx);

            // get metadata from decorator
            const grpcMethodData: {
              methodName: string;
              type: GrpcStreamTypeEnum;
              onEnd: string;
            } = getPropertyMetadata(
              MS_GRPC_METHOD_KEY,
              module,
              Utils.camelCase(method)
            );

            const isPassed = await this.app
              .getFramework()
              .runGuard(ctx, module, ctx.method);
            if (!isPassed) {
              throw new MidwayInvokeForbiddenError(ctx.method, module);
            }

            // get service from request container
            const service = await ctx.requestContext.getAsync(module);

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
                data: (call as ServerUnaryCall<any, any>).request,
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
    const { ctx, callback, grpcMethodData } = options;

    const fn = await this.applyMiddleware(async ctx => {
      return await options.service[Utils.camelCase(ctx.method)]?.call(
        options.service,
        options.data
      );
    });

    try {
      const result = await fn(ctx);
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
        `${this.configurationOptions.url || '0.0.0.0:6565'}`,
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
    if (!this.server) {
      return;
    }

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

  public getServer() {
    return this.server;
  }

  public getFrameworkName() {
    return 'midway:gRPC';
  }
}
