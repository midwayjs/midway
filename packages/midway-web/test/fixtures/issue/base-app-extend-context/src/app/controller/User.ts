import { controller, get, provide, Context, inject } from '../../../../../../../src'

@provide()
@controller('/api/user')
export class UserController {

  @inject()
  ctx: Context

  @get('/info')
  async api() {
    this.ctx.body = 'hello world'
  }

}
