import { Context, controller, get, inject, provide } from 'midway'

import { UserService } from './user.service'


@provide()
@controller('/user')
export class UserController {

  constructor(
    @inject() private userService: UserService,
  ) {}

  @get('/:id')
  public async getUser(ctx: Context): Promise<void> {
    const id = +ctx.params.id
    const user = await this.userService.getUser({ id })

    ctx.body = {
      success: true,
      message: 'OK',
      data: user,
    }
  }

}

