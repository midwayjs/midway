import { createServer, closeApp } from './utils';
import { join } from 'path';
import {
  createGRPCConsumer,
  IClientDuplexStreamService,
  IClientReadableStreamService,
  IClientUnaryService,
  IClientWritableStreamService
} from '../src';

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


export namespace math {
  export interface AddArgs {
    num?: number;
  }
  export interface Num {
    num?: number;
  }

  /**
   * client interface
   */
  export interface MathClient {
    add(): IClientUnaryService<AddArgs, Num>;
    addMore(): IClientDuplexStreamService<AddArgs, Num>;
    // 服务端推，客户端读
    sumMany(): IClientReadableStreamService<AddArgs, Num>;
    // 客户端端推，服务端读
    addMany(): IClientWritableStreamService<any, Num>;
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

    const service = await createGRPCConsumer<math.MathClient>({
      package: 'math',
      protoPath: join(__dirname, 'fixtures/proto/math.proto'),
      url: 'localhost:6565'
    });

    // 使用发送消息的写法
    let result1 = await service.add().sendMessage({
      num: 2,
    });

    expect(result1.num).toEqual(4);

    // 服务端推送
    let total = 0;
    let result2 = await service.sumMany().sendMessage({
      num: 1,
    });

    result2.forEach(data => {
      total += data.num;
    });

    expect(total).toEqual(9);

    // 客户端推送
    const data = await service.addMany()
      .sendMessage({num: 1})
      .sendMessage({num: 2})
      .sendMessage({num: 3})
      .end();

    expect(data.num).toEqual(6);

    // 双向流
    const result3= await new Promise<number>((resolve, reject) => {
      const clientStream = service.addMore();
      const duplexCall = clientStream.getCall();
      total = 0;
      let idx = 0;

      duplexCall.on('data', (data: math.Num) => {
        total += data.num;
        idx++;
        if (idx === 2) {
          clientStream.end();
          resolve(total);
        }
      });

      duplexCall.write({
        num: 3,
      });

      duplexCall.write({
        num: 6,
      });
    });

    expect(result3).toEqual(29);


    // 双向流
    const t = service.addMore();

    const result4 = await new Promise<number>((resolve, reject) => {
      total = 0;
      t.sendMessage({
        num: 2
      })
        .then(res => {
          expect(res.num).toEqual(12);
          total += res.num;
        })
        .catch(err => console.error(err))
      ;
      t.sendMessage({
        num: 5
      })
        .then(res => {
          expect(res.num).toEqual(15);
          total += res.num;
          resolve(total);
        })
        .catch(err => console.error(err))
      ;
      t.end();
    });

    expect(result4).toEqual(27);

    await closeApp(app);
  });
});
