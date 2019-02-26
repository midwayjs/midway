import { inject, provide } from 'injection';
import { controller, get } from '../../../../../../../src/';

@provide()
@controller('/', {middleware: ['homeMiddleware']})
export class My {

  @inject()
  ctx;

  @get('/', {middleware: ['apiMiddleware']})
  async index() {
    this.ctx.body = this.ctx.home + this.ctx.api;
  }
}
