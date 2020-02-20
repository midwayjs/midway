/* eslint-disable @typescript-eslint/no-explicit-any */
import { config, plugin } from '@midwayjs/decorator'

import { async, init, provide, inject } from 'injection'

@async()
@provide()
export class BaseService {

  @inject()
  ctx: any

  @config('hello')
  config: any

  @plugin('plugin2')
  plugin2: any

  @init()
  public async init() {
    await new Promise((resolve) => {
      setTimeout(() => {
        this.config.c = 10
        resolve()
      }, 100)
    })
  }

  public getData() {
    return this.plugin2.text + this.config.c
  }

}
