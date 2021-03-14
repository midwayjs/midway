import { MSProviderType, Provider, Provide, Inject, GrpcMethod } from '@midwayjs/decorator';
import { hello } from '../interface';
import { ILogger } from '@midwayjs/logger';
import { Context } from '../../../../../src';

/**
 * package helloworld
 * service Greeter
 */
@Provide()
@Provider(MSProviderType.GRPC, { package: 'hello.world' })
export class Greeter implements hello.world.Greeter {

  @Inject()
  logger: ILogger;

  @Inject()
  ctx: Context;

  /**
   * Implements the SayHello RPC method.
   */
  @GrpcMethod()
  async sayHello(request: hello.world.HelloRequest) {
    return { message: 'Hello ' + request.name };
  }
}
