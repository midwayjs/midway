import { createServer, closeApp } from './utils';
import { join } from 'path';
import { createGRPCConsumer } from '../src';
import { math } from './fixtures/base-app-stream/src/interface';

export namespace hero {
  export interface HeroService {
    findOne(data: HeroById): Promise<Hero>;
  }
  export interface HeroById {
    id?: number;
  }
  export interface Hero {
    id?: number;
    name?: string;
  }
}

export namespace helloworld {
  export interface Greeter {
    sayHello (request: HelloRequest): Promise<HelloReply>
  }

  export interface HelloRequest {
    name: string;
  }

  export interface HelloReply {
    message: string;
  }
}

describe('/test/index.test.ts', function () {

  it('should create gRPC server', async () => {
    const app = await createServer('base-app', {
      services: [
        {
          protoPath: join(__dirname, 'fixtures/proto/helloworld.proto'),
          package: 'helloworld',
        }
      ],
      url: 'localhost:6565'
    });

    const service = await createGRPCConsumer<helloworld.Greeter>({
      package: 'helloworld',
      protoPath: join(__dirname, 'fixtures/proto/helloworld.proto'),
      url: 'localhost:6565'
    });

    const result = await service.sayHello({
      name: 'harry'
    });

    expect(result).toEqual({ message: 'Hello harry' })
    await closeApp(app);
  });

  it('should create multiple grpc service in one server', async () => {
    const app = await createServer('base-app-multiple-service', {
      services: [
        {
          protoPath: join(__dirname, 'fixtures/proto/hero.proto'),
          package: 'hero',
        },
        {
          protoPath: join(__dirname, 'fixtures/proto/helloworld.proto'),
          package: 'helloworld',
        }
      ],
      url: 'localhost:6565'
    });

    const service: any = await createGRPCConsumer({
      package: 'hero',
      protoPath: join(__dirname, 'fixtures/proto/hero.proto'),
      url: 'localhost:6565'
    });

    const result = await service.findOne({
      id: 123
    }, (metadata) => {

    });

    expect(result).toEqual({ id: 1, name: 'bbbb-Hello harry' })
    await closeApp(app);
  });

  it('should support publish stream gRPC server', async () => {
    const app = await createServer('base-app-stream', {
      services: [
        {
          protoPath: join(__dirname, 'fixtures/proto/math.proto'),
          package: 'math',
        }
      ],
      url: 'localhost:6565'
    });

    const service = await createGRPCConsumer<math.Math>({
      package: 'math',
      protoPath: join(__dirname, 'fixtures/proto/math.proto'),
      url: 'localhost:6565'
    });

    const result = await service.div({
      dividend: 222,
    });

    expect(result).toEqual({
      'quotient': '1',
      'remainder': '2'
    })
    await closeApp(app);
  });
});
