import {
  Controller,
  Get,
} from '@midwayjs/decorator';

// /api/ + /bbc
@Controller('/', {})
export class HomeController {
  @Get('/', {})
  async homeSet() {
  }

  @Get('/bbc', {ignoreGlobalPrefix: true})
  async homeSet2() {
  }
}

// /api/cccc
@Controller('/api', {ignoreGlobalPrefix: true})
export class APIController3 {
  @Get('/cccc', { })
  async homeSet() {
  }
}

// /api/test/
@Controller('/test', )
export class APIController2 {
  @Get('/')
  async homeSet() {
  }
}
