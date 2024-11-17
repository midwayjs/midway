import { join } from 'path';

export const grpcServer = {
  url: 'localhost:6571',
  services: [
    {
      protoPath: join(__dirname, '../../../proto/math.proto'),
      package: 'math',
    }
  ],
}
