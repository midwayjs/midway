import { controller, get, provide, Controller } from 'midway';

@provide()
@controller('/')
export class HomeController extends Controller {

  @get('/')
  async index() {
    this.ctx.body = `Welcome to midwayjs!`;
  }
}
