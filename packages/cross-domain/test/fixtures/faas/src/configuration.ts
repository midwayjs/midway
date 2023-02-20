import { Provide, Configuration, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import * as faas from '@midwayjs/faas';
import { JSONPService } from '../../../../src/';

@Configuration({
  imports: [
    faas,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: ["test"],
        cors: {
          allowMethods: 'Post',
          credentials: true,
          origin: (req) => {
            return req.headers.origin;
          }
        }
      }
    }
  ]
})
export class AutoConfiguration {}


@Provide()
export class HomeController {
  @Inject()
  ctx;

  @Inject()
  jsonpService: JSONPService;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { method: 'post', path: '/cors'})
  async cors() {
    return { test: 123 }
  }
}
