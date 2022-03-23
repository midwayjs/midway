import { Configuration, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import * as faas from '@midwayjs/faas';
import * as proxy from '../../../../src';

@Configuration({
  imports: [
    faas,
    proxy
  ],
  importConfigs: [
    {
      default: {
        httpProxy: [
          {
            // https://gw.alicdn.com/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png
            match: /\/tfs\//,
            host: 'https://gw.alicdn.com',
          },
          {
            // https://g.alicdn.com/mtb/lib-mtop/2.6.1/mtop.js
            match: /\/gcdn\/(.*)$/,
            target: 'https://g.alicdn.com/$1',
          }
        ],
      }
    }
  ]
})
export class AutoConfiguration {}

@Provide()
export class HelloHttpService {
  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/*', method: 'get'})
  async get() {
   return 'hello'
  }
}

