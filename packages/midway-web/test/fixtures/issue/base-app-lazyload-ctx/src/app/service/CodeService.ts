import { inject, provide } from 'injection';
import { Service } from '../../Service';
import sleep from '../../package/Sleep';

@provide()
export class CodeService {
  @inject()
  private service: Service;

  @inject()
  ctx;

  async list() {
    await sleep(50);
    const data = await this.service.user.userinfo();
    return `Code: ${this.ctx.path}, ${data}`;
  }
}
