import { join } from 'path';

export const grpcServer = {
  url: 'localhost:6569',
  services: [
    {
      protoPath: join(__dirname, '../../../proto/hello_world.proto'),
      package: 'hello.world',
    }
  ],
}

