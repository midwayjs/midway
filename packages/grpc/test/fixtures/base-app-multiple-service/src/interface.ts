import { Metadata } from '@grpc/grpc-js';
import { IClientOptions, IClientUnaryService } from '../../../../src';

export namespace hero {
  export interface HeroService {
    findOne(data: HeroById, metadata?: Metadata): Promise<Hero>;
  }
  export interface HeroServiceClient {
    findOne(options?: IClientOptions): IClientUnaryService<HeroById, Hero>;
  }
  export interface HeroById {
    id?: number;
  }
  export interface Hero {
    id?: number;
    name?: string;
  }

  export interface HeroService2 {
    findOne2(data: HeroById, metadata?: Metadata): Promise<Hero>;
  }
  export interface HeroService2Client {
    findOne2(options?: IClientOptions): IClientUnaryService<HeroById, Hero>;
  }
}

export namespace helloworld {
  export interface Greeter {
    sayHello (request: HelloRequest): Promise<HelloReply>
  }

  export interface GreeterClient {
    sayHello (options?: IClientOptions): IClientUnaryService<HelloRequest, HelloReply>
  }

  export interface HelloRequest {
    name: string;
  }

  export interface HelloReply {
    message: string;
  }
}
