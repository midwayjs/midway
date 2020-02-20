import { provide } from 'injection'

import { controller, get } from '../../../../../../../src'

@provide()
@controller('/')
export class My {

  @get('/')
  async index(ctx) {
    ctx.body = 'root_test'
  }

}
