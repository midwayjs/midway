import { provide } from 'injection';

// eslint-disable-next-line import/named
import { controller, get } from '../../../../../../../src';

@provide()
@controller('/api')
export class APIController {

  @get('/hello')
  async index(ctx) {
    ctx.body = 'api';
  }

}
