import { provide } from 'injection';

// eslint-disable-next-line import/named
import { controller, get } from '../../../../../../../src';

@provide()
@controller('/')
export class My {
  @get('/')
  async index(ctx) {
    ctx.body = 'root_test';
  }
}
