import { controller, get, provide, Context, inject } from '../../../../../../../src'
import { Service } from '../../Service'

@provide()
@controller('/api/user')
export class UserController {

  @inject()
  ctx: Context

  @inject()
  service: Service

  @get('/info')
  async api() {
    this.ctx.body = await this.service.user.userinfo()
  }

}
