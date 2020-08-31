import { provide, controller, get } from '../../../../../../../src/';

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
