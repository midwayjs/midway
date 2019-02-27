import { inject, provide } from 'injection';
import { controller, get, post } from '../../../../../../../src/';

@provide()
@controller('/', {middleware: ['homeMiddleware']})
export class My {

  @inject()
  ctx;

  @get('/', {middleware: ['apiMiddleware']})
  @post('/api/data')
  async index() {
    this.ctx.body = this.ctx.home + (this.ctx.api || '');
  }
}
