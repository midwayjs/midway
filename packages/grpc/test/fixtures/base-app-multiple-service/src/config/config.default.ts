import { IMidwayGRPCConfigOptions } from '../../../../../src';
import { join } from 'path';

export const grpc = {
  services: [
    {
      url: 'localhost:6565',
      protoPath: join(__dirname, '../../../proto/helloworld.proto'),
      package: 'helloworld'
    }
  ]
} as IMidwayGRPCConfigOptions;
