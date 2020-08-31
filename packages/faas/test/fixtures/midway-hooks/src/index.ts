import { Provide, Func, Inject } from '@midwayjs/decorator';
import { FunctionHandler, FaaSContext } from '../../../../src';

@Provide()
@Func('index.handler')
export class IndexHandler implements FunctionHandler {
  @Inject()
  ctx: FaaSContext;

  /**
   * 此数据为前端 tce 网关请求过来的数据结构
   * @param event
   */
  async handler() {
    const ctx = this.ctx;
    const useCtx = this.ctx.hooks.useContext();
    return ctx === useCtx;
  }
}
