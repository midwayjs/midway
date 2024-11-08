import { join } from 'path';

export const grpc = {
  services: [
    {
      url: 'localhost:6566',
      protoPath: join(__dirname, '../../../proto/helloworld.proto'),
      package: 'helloworld',
      clientOptions: {
        'grpc.keepalive_time_ms': 5000,
      }
    }
  ]
}

export const grpcServer = {
  url: 'localhost:6566',
  services: [
    {
      protoPath: join(__dirname, '../../../proto/hero2.proto'),
      package: 'hero2',
    },
    {
      protoPath: join(__dirname, '../../../proto/helloworld.proto'),
      package: 'helloworld',
    }
  ],
}

