import { join } from 'path';

export const grpcServer = {
  services: [
    {
      protoPath: join(__dirname, '../../../proto/helloworld.proto'),
      package: 'helloworld',
    }
  ],
}
