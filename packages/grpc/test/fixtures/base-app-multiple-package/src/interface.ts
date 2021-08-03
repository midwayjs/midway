import { IClientOptions, IClientUnaryService } from '../../../../src';

export namespace hello {
  export namespace world {
    export interface HelloRequest {
      name: string;
    }

    export interface HelloReply {
      message: string;
    }

    // The greeting service definition.
    export interface Greeter {
      // Sends a greeting
      sayHello(data: HelloRequest): Promise<HelloReply>;
    }

    export interface GreeterClient {
      sayHello (options?: IClientOptions): IClientUnaryService<HelloRequest, HelloReply>
    }
  }
}
