import { Context, controller, get, provide } from 'midway';

@provide()
@controller('/')
export class HomeController {

  @get('/')
  async index(ctx: Context) {
    ctx.body = `Welcome to midwayjs!`;
  }
}
