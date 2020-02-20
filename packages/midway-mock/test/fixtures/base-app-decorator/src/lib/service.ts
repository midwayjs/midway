import { async, init, provide, inject } from 'injection'
import { config, plugin } from '@midwayjs/decorator'

@async()
@provide()
export class BaseService {

  @inject()
  ctx

  @config('hello')
  config

  @plugin('plugin2')
  plugin2

  @init()
  async init() {
    await new Promise((resolve) => {
      setTimeout(() => {
        this.config.c = 10
        resolve()
      }, 100)
    })
  }

  getData() {
    return this.plugin2.text + this.config.c
  }

}
