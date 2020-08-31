import { provide, controller, get, inject } from '../../../../../../../src';

@provide()
@controller('/circular')
export class CircularController {
  @inject()
  planA: any;

  @get('/test')
  async test(ctx) {
    ctx.body = 'success';
  }
}
