import { Configuration, Controller, Get } from '@midwayjs/decorator';
import * as express from '../../../../../web-express';

@Configuration({
  imports: [
    require('../../../../src'),
    express
  ],
  importConfigs: [
    {
      default: {
        keys: '12345'
      }
    }
  ]
})
export class AutoConfiguration {
}

@Controller('/')
export class HomeController {

  @Get('/get')
  async get(req) {
    // ctx.session.a = '1';
    return req.session;
  }
  @Get('/set')
  async set(req) {
    req.session = req.query;
    return req.session;
  }
  @Get('/setKey')
  async setKey(req) {
    req.session.key = req.query.key;
    return req.session;
  }
  @Get('/remove')
  async remove(req) {
    req.session = null;
    return req.session;
  }
  @Get('/maxAge')
  async maxAge(req) {
    req.session.maxAge = Number(req.query.maxAge);
    return req.session;
  }
}
