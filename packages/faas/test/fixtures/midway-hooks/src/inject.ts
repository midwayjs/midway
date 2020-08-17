import { Provide, Func, Inject } from '@midwayjs/decorator';
import { FunctionHandler, FaaSContext } from '../../../../src';
import { InjectInstance } from './instance';

@Provide()
@Func('inject.handler')
export class InjectHandler implements FunctionHandler {
  @Inject()
  ctx: FaaSContext;

  @Inject()
  injectInstance: InjectInstance;

  /**
   * 此数据为前端 tce 网关请求过来的数据结构
   * @param event
   */
  async handler() {
    const ctxInstance = await this.ctx.requestContext.getAsync(InjectInstance);
    const useInjectInstance = await this.ctx.hooks.useInject(InjectInstance);

    return (
      this.injectInstance === ctxInstance &&
      this.injectInstance === useInjectInstance
    );
  }
}
