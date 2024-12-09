import { All, Configuration, Controller } from '@midwayjs/core';
import * as koa from '@midwayjs/web';
import * as defaultConfig from './config/config.default';
import * as proxy from '../../../../src';

@Configuration({
  imports: [
    koa,
    proxy
  ],
  importConfigs: [
    {
      default: defaultConfig
    }
  ]
})
export class AutoConfiguration {}

@Controller()
export class HelloHttpService {
  @All('/*')
  async get() {
   return 'hello'
  }
}

