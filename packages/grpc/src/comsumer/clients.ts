import * as  assert from 'assert';
import {
  Config,
  Init,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
  Utils,
  ILogger,
} from '@midwayjs/core';
import { credentials, loadPackageDefinition } from '@grpc/grpc-js';
import {
  DefaultConfig,
  IClientOptions,
  IGRPCClientServiceOptions,
} from '../interface';
import { finePackageProto, loadProto } from '../util';
import { ClientUnaryRequest } from './type/unary-request';
import { ClientDuplexStreamRequest } from './type/duplex-request';
import { ClientReadableRequest } from './type/readable-request';
import { ClientWritableRequest } from './type/writeable-request';

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
      this.logger.debug('Please set gRPC services in your config["grpc"]');
      return;
    }
    for (const cfg of this.grpcConfig['services']) {
      await this.createClient(cfg);
    }
  }

  async createClient<T>(options: IGRPCClientServiceOptions): Promise<void> {
    const packageDefinition = await loadProto({
      loaderOptions: options.loaderOptions,
      protoPath: options.protoPath,
    });
    const allProto = loadPackageDefinition(packageDefinition);
    const packageProto: any = finePackageProto(allProto, options.package);

    for (const definition in packageDefinition) {
      if (!packageDefinition[definition]['format']) {
        const serviceName = definition.replace(`${options.package}.`, '');
        const connectionService: T = new packageProto[serviceName](
          options.url,
          credentials.createInsecure(),
          options.clientOptions
        );

        for (const methodName of Object.keys(packageDefinition[definition])) {
          const originMethod = connectionService[methodName];
          assert(originMethod, 'No method found in proto file, path:'
            + options.protoPath + ` method: ${methodName}, definition: ${definition}, serviceName: ${serviceName}`);

          connectionService[methodName] = (
            clientOptions: IClientOptions = {}
          ) => {
            return this.getClientRequestImpl(
              connectionService,
              originMethod,
              clientOptions
            );
          };
          connectionService[Utils.camelCase(methodName)] =
            connectionService[methodName];
        }
        this.set(definition, connectionService);
      }
    }
  }

  getService<T>(serviceName: string): T {
    return this.get(serviceName);
  }

  getClientRequestImpl(client, originalFunction, options = {}) {
    const genericFunctionSelector =
      (originalFunction.requestStream ? 2 : 0) |
      (originalFunction.responseStream ? 1 : 0);

    let genericFunctionName;
    switch (genericFunctionSelector) {
      case 0:
        genericFunctionName = new ClientUnaryRequest(
          client,
          originalFunction,
          options
        );
        break;
      case 1:
        genericFunctionName = new ClientReadableRequest(
          client,
          originalFunction,
          options
        );
        break;
      case 2:
        genericFunctionName = new ClientWritableRequest(
          client,
          originalFunction,
          options
        );
        break;
      case 3:
        genericFunctionName = new ClientDuplexStreamRequest(
          client,
          originalFunction,
          options
        );
        break;
    }

    return genericFunctionName;
  }
}

export const createGRPCConsumer = async <T>(
  options: IGRPCClientServiceOptions
): Promise<T> => {
  const clients = new GRPCClients();
  options.url = options.url || 'localhost:6565';
  clients.grpcConfig = {
    services: [options],
  };

  await clients.initService();
  if (typeof options.service === 'string' && options.service) {
    const pkg = clients.grpcConfig.services[0].package
    const name = options.service.startsWith(`${pkg}.`) ? options.service : `${pkg}.${options.service}`
    return clients.getService(name);
  }
  return Array.from(clients.values())[0];
};
