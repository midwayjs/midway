import { Metadata } from '@grpc/grpc-js';

export namespace hero {
  export interface HeroService {
    findOne(data: HeroById, metadata?: Metadata): Promise<Hero>;
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
