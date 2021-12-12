import { Configuration, Controller, Get } from '@midwayjs/decorator';
import * as express from '../../../../../web-express';

@Configuration({
  imports: [
    express,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: '12345',
        session: {
          sameSite: 'none',
        }
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
    return req.session;
  }
  @Get('/set')
  async set(req) {
    req.session = req.query;
    return req.session;
  }
}
