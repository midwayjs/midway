import { join } from 'path';

export const grpcServer = {
  services: [
    {
      protoPath: join(__dirname, '../../../proto/hello_world.proto'),
      package: 'hello.world',
    }
  ],
}

