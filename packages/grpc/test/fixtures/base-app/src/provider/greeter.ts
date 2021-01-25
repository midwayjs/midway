import { MSProviderType, Provider, Provide, Inject } from '@midwayjs/decorator';
import { helloworld } from '../interface';
import { ILogger } from '@midwayjs/logger';

/**
 * package helloworld
 * service Greeter
 */
@Provide()
@Provider(MSProviderType.GRPC, { package: 'helloworld' })
export class Greeter implements helloworld.Greeter {

  @Inject()
  logger: ILogger;

  /**
   * Implements the SayHello RPC method.
   */
  async sayHello(request: helloworld.HelloRequest) {
    this.logger.info('this is a context logger');
    return { message: 'Hello ' + request.name }
  }
}
