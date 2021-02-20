import { MSProviderType, Provider, Provide, Inject, GrpcMethod } from '@midwayjs/decorator';
import { helloworld } from '../interface';
import { ILogger } from '@midwayjs/logger';
import { Context } from '../../../../../src';
import { Metadata } from '@grpc/grpc-js';

/**
 * package helloworld
 * service Greeter
 */
@Provide()
@Provider(MSProviderType.GRPC, { package: 'helloworld' })
export class Greeter implements helloworld.Greeter {

  @Inject()
  logger: ILogger;

  @Inject()
  ctx: Context;

  /**
   * Implements the SayHello RPC method.
   */
  @GrpcMethod()
  async sayHello(request: helloworld.HelloRequest) {
    this.logger.info('this is a context logger');
    const serverMetadata = new Metadata();
    serverMetadata.add('Set-Cookie', 'yummy_cookie=choco');
    this.ctx.sendMetadata(serverMetadata);
    return { message: 'Hello ' + request.name }
  }
}
