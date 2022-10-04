import { Configuration, Controller, Get, Inject, Post } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { JSONPMiddleware, JSONPService } from '../../../../src/index';

@Configuration({
  imports: [
    express,
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


@Controller('/')
export class HomeController {

  @Inject()
  jsonpService: JSONPService;

  @Get('/cors')
  @Post('/cors')
  async cors() {
    return { test: 123 }
  }

  @Post('/jsonp', { middleware: [JSONPMiddleware]})
  async jsonp() {
    return { test: 123 };
  }
}
