import { Provide, Func, Inject } from '@midwayjs/decorator';
import { FunctionHandler, FaaSContext } from '../../../../src';

@Provide()
@Func('config.handler')
export class ConfigHandler implements FunctionHandler {
  @Inject()
  ctx: FaaSContext;

  /**
   * 此数据为前端 tce 网关请求过来的数据结构
   * @param event
   */
  async handler() {
    return this.ctx.hooks.useConfig('env')
  }
}
