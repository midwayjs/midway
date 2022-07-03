import { join } from 'path';

export const grpc = {
  services: [
    {
      url: 'localhost:6565',
      protoPath: join(__dirname, '../../../proto/helloworld.proto'),
      package: 'helloworld',
      clientOptions: {
        'grpc.keepalive_time_ms': 5000,
      }
    }
  ]
}

export const grpcServer = {
  services: [
    {
      protoPath: join(__dirname, '../../../proto/hero.proto'),
      package: 'hero',
    },
    {
      protoPath: join(__dirname, '../../../proto/helloworld.proto'),
      package: 'helloworld',
    }
  ],
}

