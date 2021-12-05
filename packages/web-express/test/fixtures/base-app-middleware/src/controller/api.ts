import {
  Controller,
  Get,
  Provide,
  Inject,
} from '@midwayjs/decorator';
import { IMidwayExpressContext, IMidwayExpressRequest } from '../../../../../src';

@Provide()
@Controller('/')
export class APIController {

  @Inject()
  ctx: IMidwayExpressContext;

  @Inject()
  req: IMidwayExpressRequest;

  @Get('/', { middleware: []})
  async home() {
    return this.req.user + 'hello world';
  }

  @Get('/11', { middleware: ['testMiddleware']})
  async home1() {
    return this.req.user + 'hello world11';
  }
}
