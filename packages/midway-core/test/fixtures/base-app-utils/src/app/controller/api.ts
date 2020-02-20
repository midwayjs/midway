import { BaseService } from '../../lib/service'


const Controller = require('egg').Controller


class ApiController extends Controller {

  async index() {
    const context = this.ctx.app.applicationContext
    const service = await context.getAsync(BaseService)
    this.ctx.body = await service.getData()
  }

}

module.exports = ApiController
