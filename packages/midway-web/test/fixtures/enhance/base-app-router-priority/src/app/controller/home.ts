import { provide } from 'injection'

import { controller, get, priority } from '../../../../../../../src'

@provide()
@priority(-1)
@controller('/')
export class HomeController {

  @get('/hello')
  async index(ctx) {
    ctx.body = 'hello'
  }

  @get('/*')
  async all(ctx) {
    ctx.body = 'world'
  }

}
