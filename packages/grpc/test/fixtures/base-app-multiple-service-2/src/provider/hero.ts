import * as assert from 'assert';
import { GrpcMethod, MSProviderType, Provider, Provide, Inject, Init } from '@midwayjs/core';
import { helloworld, hero2 } from '../interface';
import { Clients, Context } from '../../../../../src';

@Provide()
@Provider(MSProviderType.GRPC, { package: 'hero2' })
export class HeroService implements hero2.HeroService {

  @Inject()
  ctx: Context;

  @Inject()
  grpcClients: Clients;

  greeterService: helloworld.GreeterClient;

  @Init()
  async init() {
    this.greeterService = this.grpcClients.getService<helloworld.GreeterClient>('helloworld.Greeter');
  }

  @GrpcMethod()
  async findOne(data) {
    assert(this.ctx, 'should get context');
    const { metadata } = this.ctx;
    assert(metadata, 'should get metadata');

    const rpcMethodType = metadata.get('rpc.method.type');
    assert(rpcMethodType[0] === 'unary', `should get rpc.method.type, but got "${rpcMethodType[0]}"`);

    const result = await this.greeterService.sayHello().sendMessage({
      name: 'harry'
    });
    return {
      id: 1,
      name: 'bbbb-' + result.message,
    };
  }
}
