import { Inject } from '@midwayjs/core';
import { Args, Context, Query, Resolver, Subscription } from '../../../../../src';
import { HelloService } from '../service/hello';

@Resolver()
export class HelloResolver {
  @Inject()
  helloService: HelloService;

  @Query('decoratedHello')
  async decoratedHello() {
    return await this.helloService.say();
  }

  @Query('decoratedEcho')
  decoratedEcho(@Args('message') message: string, @Context() context) {
    return `${message}:${context.get('x-apollo-test')}`;
  }

  @Subscription('counter')
  async *counter() {
    yield {
      counter: 1,
    };
  }
}
