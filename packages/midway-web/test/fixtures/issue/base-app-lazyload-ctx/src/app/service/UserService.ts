import { inject, provide } from '../../../../../../../src';
import sleep from '../../package/Sleep';
import { Service } from '../../Service';

@provide()
export class UserService {
  @inject()
  private ctx: any;

  @inject()
  private service: Service;

  async userinfo() {
    await sleep(100);
    console.log(this.service.ctx.requestContext.id);
    return `User: ${this.ctx.path}, Hello Result`;
  }
}
