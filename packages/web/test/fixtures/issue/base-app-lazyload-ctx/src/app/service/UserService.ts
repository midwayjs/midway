import { Inject, Provide } from '@midwayjs/decorator';
import sleep from '../../package/Sleep';
import { Service } from '../../Service';

@Provide()
export class UserService {
  @Inject()
  private ctx: any;

  @Inject()
  private service: Service;

  async userinfo() {
    await sleep(100);
    console.log(this.service.ctx.requestContext.id);
    return `User: ${this.ctx.path}, Hello Result`;
  }
}
