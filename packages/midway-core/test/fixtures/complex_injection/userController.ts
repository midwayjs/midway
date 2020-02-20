import { inject, scope, ScopeEnum } from 'injection'

import { UserService } from './userService'

@scope(ScopeEnum.Request)
export class UserController {

  @inject('ctx')
  ctx

  @inject('newKey')
  dbApi

  @inject()
  userService: UserService

  async index() {
    const { ctx } = this
    ctx.body = await this.userService.getUsers()
    ctx.status = 200
  }

}
