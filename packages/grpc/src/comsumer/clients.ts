import { Config, Init, Logger, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { credentials, loadPackageDefinition } from '@grpc/grpc-js';
import { DefaultConfig } from '../interface';
import { loadProto } from '../util';
import * as camelCase from 'camelcase';
import { ILogger } from '@midwayjs/logger';

@Provide('clients')
@Scope(ScopeEnum.Singleton)
export class GRPCClients extends Map {

  @Config('grpc')
  grpcConfig: DefaultConfig;

  @Logger()
  logger: ILogger;

  @Init()
  async initService() {
    if (!this.grpcConfig['services']) {
      this.logger.error('Please set gRPC services in your config["grpc"]');
      return;
    }
    for(const cfg of this.grpcConfig['services']) {
      const packageDefinition = await loadProto({
        loaderOptions: cfg.loaderOptions,
        protoPath: cfg.protoPath,
      });
      const packageProto: any = loadPackageDefinition(packageDefinition)[cfg.package];
      for (const definition in packageDefinition) {
        if (!packageDefinition[definition]['format']) {
          const serviceName = definition.replace(`${cfg.package}.`, '');
          const connectionService = new packageProto[serviceName](cfg.url, credentials.createInsecure());
          for(const methodName of Object.keys(packageDefinition[definition])) {
            const originMethod = connectionService[methodName];
            connectionService[methodName] = async (...args) => {
              return new Promise((resolve, reject) => {
                originMethod.call(connectionService, args[0], (err, response) => {
                  if (err) {
                    reject(err);
                  }
                  resolve(response);
                });
              });
            };
            connectionService[camelCase(methodName)] = connectionService[methodName];
          }
          this.set(definition, connectionService);
        }
      }
    }
  }

  getService<T>(serviceName: string): T {
    return this.get(serviceName);
  }
}
