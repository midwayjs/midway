import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/decorator';

@Controller('/')
export class APIController {

  @Inject()
  ctx: any;

  @Get('/')
  async home() {
    return 'hello world';
  }
}
