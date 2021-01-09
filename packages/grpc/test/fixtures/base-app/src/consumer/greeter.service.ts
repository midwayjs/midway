import { Config, Init, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { helloworld } from '../interface';
import { credentials } from '@grpc/grpc-js';
import { IMidwayGRPCConfigOptions } from '../../../../../src';

@Provide()
@Scope(ScopeEnum.Singleton)
export class GreeterService implements helloworld.Greeter {

  client;

  @Inject('grpc:definitions:helloworld')
  grpcDefinition;

  @Config('grpc')
  grpcConfig: IMidwayGRPCConfigOptions;

  @Init()
  async initService() {
    const helloworld_proto = this.grpcDefinition['helloworld'];
    this.client = new helloworld_proto.Greeter('localhost:50051', credentials.createInsecure());
  }

  async sayHello(request: helloworld.HelloRequest): Promise<helloworld.HelloReply> {
    return new Promise((resolve, reject) => {
      this.client.sayHello(request, (err, response) => {
        if (err) {
          reject(err);
        }
        resolve(response);
      });
    });
  }
}
