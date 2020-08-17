import { Provide, Func, Inject } from '@midwayjs/decorator';
import { FunctionHandler, FaaSContext } from '../../../../src';

@Provide()
@Func('logger.handler')
export class LoggerHandler implements FunctionHandler {
  @Inject()
  ctx: FaaSContext;

  /**
   * 此数据为前端 tce 网关请求过来的数据结构
   * @param event
   */
  async handler() {
    const logger = this.ctx.hooks.useLogger();
    return !!logger;
  }
}
