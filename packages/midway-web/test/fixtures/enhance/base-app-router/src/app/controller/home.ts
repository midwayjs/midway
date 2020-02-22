import { provide } from 'injection';

// eslint-disable-next-line import/named
import { controller, get } from '../../../../../../../src';

@provide()
@controller('/')
export class HomeController {

  @get('/')
  @get('/home')
  @get('/poster')
  async index(ctx) {
    ctx.body = 'hello';
  }

}
