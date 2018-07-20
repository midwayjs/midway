import {controller, provide, get} from 'midway';

@provide()
@controller('/')
export class HomeController {

  @get('/')
  async index(ctx) {
    ctx.body = 'hi, midway';
  }
}
