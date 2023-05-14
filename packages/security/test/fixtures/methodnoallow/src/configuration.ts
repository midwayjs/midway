import { Configuration, Controller, Inject, All } from '@midwayjs/core';
import * as framework from '@midwayjs/koa';
@Configuration({
  imports: [
    framework,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: ['a'],
        security: {
          methodnoallow: {
            enable: true,
            ignore: ['/ok']
          }
        }
      }
    }
  ]
})
export class AutoConfiguration {}


@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @All('/ok')
  async html() {
    return 'ok';
  }

  @All('/notok')
  async notok() {
    return 'notok';
  }
}
