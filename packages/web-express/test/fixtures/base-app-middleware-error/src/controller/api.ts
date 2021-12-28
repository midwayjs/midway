import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/decorator';
import { Context } from '../../../../../src';

@Controller('/')
export class APIController {

  @Inject()
  ctx: Context;

  @Get('/error')
  @Get('/')
  async home() {
    return 'hello world';
  }
}
