import {
  provide,
  FunctionHandler,
  func,
  inject,
  FaaSContext,
} from '@ali/midway-faas';

@provide()
@func('ping.handler')
export class ChannelPingHandler implements FunctionHandler {
  async handler() {}
}

@provide()
@func('post.handler')
export class PostPingHandler implements FunctionHandler {
  @inject()
  ctx: FaaSContext;

  async handler() {}
}
