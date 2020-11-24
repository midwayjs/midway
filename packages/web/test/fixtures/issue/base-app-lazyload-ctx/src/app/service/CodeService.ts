import { Inject, Provide } from '@midwayjs/decorator';
import { Service } from '../../Service';
import sleep from '../../package/Sleep';

@Provide()
export class CodeService {
  @Inject()
  private service: Service;

  @Inject()
  ctx;

  async list() {
    await sleep(50);
    const data = await this.service.user.userinfo();
    return `Code: ${this.ctx.path}, ${data}`;
  }
}
