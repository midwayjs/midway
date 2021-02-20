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
  export interface DivArgs {
    dividend?: number;
    divisor?: number;
  }
  export interface DivReply {
    quotient?: number;
    remainder?: number;
  }
  export interface FibArgs {
    limit?: number;
  }
  export interface Num {
    num?: number;
  }
  export interface FibReply {
    count?: number;
  }

  export interface MathClient {
    div(): IClientUnaryService<DivArgs, DivReply>;
    divMany(): Promise<IClientDuplexStreamService<DivReply, DivArgs>>;
    // 服务端推，客户端读
    fib(): IClientReadableStreamService<FibArgs, Num>;
    // 客户端端推，服务端读
    sum(): IClientWritableStreamService<Num, Num>;
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

    // 一元操作
    // let result: any = await service.div({
    //   dividend: 222,
    // });
    //
    // expect(result).toEqual({
    //   'quotient': 1,
    //   'remainder': 2,
    // });

    // 使用发送消息的写法
    // let result1 = await service.div().sendMessage({
    //   dividend: 222,
    // });
    //
    // expect(result1.quotient).toEqual(1);
    //
    //
    // // 服务端推送
    // let total = 0;
    // let result2 = await service.fib().sendMessage({
    //   limit: 1,
    // });
    //
    // result2.forEach(data => {
    //   total += data.num;
    // });
    //
    // expect(total).toEqual(9);
    //
    // // 客户端推送
    // const data = await service.sum()
    //   .sendMessage({num: 1})
    //   .sendMessage({num: 2})
    //   .sendMessage({num: 3})
    //   .end();
    //
    // expect(data.num).toEqual(6);


    // 双向流
    const t = await service.divMany();

    await new Promise<void>((resolve, reject) => {
      t.sendMessage({})
        .then(res => {
          console.log('Client: Stream Message Received = ', res); // Client: Stream Message Received = {id: 0}
        })
        .catch(err => console.error(err))
      ;
      t.sendMessage({})
        .then(res => {
          console.log('Client: Stream Message Received = ', res); // Client: Stream Message Received = {id: 1}
          resolve();
        })
        .catch(err => console.error(err))
      ;
      t.end();
    });

    await closeApp(app);
  });
});
