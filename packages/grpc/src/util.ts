import * as protoLoader from '@grpc/proto-loader';
import { IGRPCClientServiceOptions } from './interface';
import { GRPCClients } from './comsumer/clients';

export const loadProto = (options: {
  protoPath: string;
  loaderOptions?: any;
}) => {
  return protoLoader.loadSync(
    options.protoPath,
    Object.assign(
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      options.loaderOptions || {}
    )
  );
};

export const createGRPCConsumer = async <T>(
  options: IGRPCClientServiceOptions
): Promise<T> => {
  const clients = new GRPCClients();
  options.url = options.url || 'localhost:6565';
  clients.grpcConfig = {
    services: [options],
  };

  await clients.initService();
  return Array.from(clients.values())[0];
};
