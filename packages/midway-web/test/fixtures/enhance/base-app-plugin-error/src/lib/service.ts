import { provide, inject } from '../../../../../../src';

@provide()
export class UserService {
  @inject()
  ctx;

  async hello() {
    return 'world,' + Object.keys(this.ctx.query).length;
  }
}
