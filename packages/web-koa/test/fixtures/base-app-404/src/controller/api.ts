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

  @Get('/')
  async home() {
    return 'hello world';
  }
}
