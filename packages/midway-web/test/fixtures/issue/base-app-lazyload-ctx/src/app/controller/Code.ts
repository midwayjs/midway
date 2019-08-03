import { controller, get, provide, Context, inject } from '../../../../../../../src/';
import { Service } from '../../Service';

@provide()
@controller('/api/code')
export class CodeController {
  @inject()
  ctx: Context;

  @inject()
  service: Service;

  @get('/list')
  async api() {
    this.ctx.body = await this.service.code.list();
  }
}
