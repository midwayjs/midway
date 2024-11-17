import { join } from 'path';

export const grpc = {
  services: [
    {
      url: 'localhost:6575',
      protoPath: join(__dirname, '../../../proto/helloworld.proto'),
      package: 'helloworld',
      clientOptions: {
        'grpc.keepalive_time_ms': 5000,
      }
    }
  ]
}

export const grpcServer = {
  url: 'localhost:6575',
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

