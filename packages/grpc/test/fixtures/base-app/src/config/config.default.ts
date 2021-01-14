import { IMidwayGRPCConfigOptions } from '../../../../../src';
import { join } from 'path';

export const grpc = {
  clients: [
    {
      host: 'localhost',
      port: 50051,
      protoPath: join(__dirname, '../../../proto/helloworld.proto'),
      package: 'helloworld'
    }
  ]
} as IMidwayGRPCConfigOptions;
