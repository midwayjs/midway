import { Server, ServerCredentials, loadPackageDefinition, setLogger } from '@grpc/grpc-js';
import * as grpc from '@grpc/grpc-js';
import {
  BaseFramework,
  getClassMetadata,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
  IMidwayBootstrapOptions,
  listModule,
  MidwayFrameworkType,
  MidwayRequestContainer,
} from '@midwayjs/core';

import {
  MS_PRODUCER_KEY, MSProducerType
} from '@midwayjs/decorator';
import {
  IMidwayGRPCApplication, IMidwayGRPConfigurationOptions,
} from './interface';
import { MidwayGRPCContextLogger } from './logger';

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
    // this.app.use((req, res, next) => {
    //   const ctx = { req, res } as IMidwayExpressContext;
    //   ctx.logger = new MidwayGRPCContextLogger(ctx, this.appLogger);
    //   ctx.startTime = Date.now();
    //   ctx.requestContext = new MidwayRequestContainer(
    //     ctx,
    //     this.getApplicationContext()
    //   );
    //   (req as any).requestContext = ctx.requestContext;
    //   ctx.requestContext.registerObject('req', req);
    //   ctx.requestContext.registerObject('res', res);
    //   ctx.requestContext.ready();
    //   next();
    // });

    await this.loadService();
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

    console.log(gRPCModules);

    if (this.configurationOptions.packageDefinition) {
      const definitions = grpc.loadPackageDefinition(this.configurationOptions.packageDefinition);
      const protoModule = definitions[this.configurationOptions.package];

      for (const protoService in protoModule) {
        // TODO get service from container
        // TODO find method
        // binding service to server
        this.server.addService(protoService['service'], {sayHello: sayHello});
      }
    }


  }

  public async run(): Promise<void> {
    this.server.bindAsync(`0.0.0.0:${this.configurationOptions.port}`, ServerCredentials.createInsecure(), (err: Error | null, bindPort: number) => {
      if (err) {
        throw err;
      }

      this.logger.info(`gRPC:Server:${bindPort}`, new Date().toLocaleString());
      this.server.start();
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
