import { provide, controller, get } from '../../../../../../../src/';

@provide()
@controller('/')
class My {
  @get('/')
  async index(ctx) {
    ctx.body = 'root_test';
  }
}
export = My;
