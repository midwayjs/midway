import { Config, Configuration, getProviderId, Logger } from '@midwayjs/decorator';
import { IMidwayGRPCOptions } from '../interface';
import { Server, ServerCredentials, setLogger, loadPackageDefinition } from '@grpc/grpc-js';
import * as camelCase from 'camelcase';
import { ILogger } from '@midwayjs/logger';

@Configuration({
  namespace: 'grpc'
})
export class AutoConfiguration {

  @Config()
  grpcConfig: IMidwayGRPCOptions;

  @Logger()
  logger: ILogger;

  async onReady() {
    setLogger(this.logger);
    if (this.grpcConfig.packageDefinition) {
      const definitions = loadPackageDefinition(this.grpcConfig.packageDefinition);
      const protoModule = definitions[this.grpcConfig.package];

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
}
