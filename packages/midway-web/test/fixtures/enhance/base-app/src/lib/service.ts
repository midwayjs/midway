import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class UserService {
  @Inject()
  ctx;

  async hello() {
    return 'world,' + Object.keys(this.ctx.query).length;
  }
}
