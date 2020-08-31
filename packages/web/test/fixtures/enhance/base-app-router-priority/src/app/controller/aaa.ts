import { provide, controller, get } from '../../../../../../../src/';

@provide()
@controller('/api')
export class APIController {

  @get('/hello')
  async index(ctx) {
    ctx.body = 'api';
  }

}
