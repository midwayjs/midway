import { All, Configuration, Controller, Inject } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import * as proxy from '../../../../src';

@Configuration({
  imports: [
    express,
    proxy
  ],
  importConfigs: [
    {
      default: {
        keys: ['test'],
        httpProxy: {
          strategy: {
            a: {
              // https://gw.alicdn.com/tfs/TB1.1EzoBBh1e4jSZFhXXcC9VXa-48-48.png
              match: /\/tfs\//,
              host: 'https://gw.alicdn.com',
            },
            b: {
              // https://g.alicdn.com/mtb/lib-mtop/2.6.1/mtop.js
              match: /\/bdimg\/(.*)$/,
              target: 'https://sm.bdimg.com/$1',
            },
            c: {
              // https://httpbin.org/
              match: /\/httpbin\/(.*)$/,
              target: 'https://httpbin.org/$1',
            },
            d: {
              match: /.*?baidu.*$/,
              target: 'https://www.baidu.com/'
            }
          }
        },
      }
    }
  ]
})
export class AutoConfiguration {
}

@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @All('/*')
  async all() {
    return 'hello';
  }
}

