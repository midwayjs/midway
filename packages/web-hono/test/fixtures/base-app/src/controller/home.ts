import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  SetHeader,
} from '@midwayjs/core';

@Controller('/api')
export class HomeController {
  @Get('/hello')
  async hello(@Query('name') name: string) {
    return `hello ${name}`;
  }

  @Post('/echo')
  async echoBody(@Body('name') name: string, @Headers('x-id') id: string) {
    return {
      name,
      id,
    };
  }

  @Get('/status')
  @HttpCode(201)
  async statusCode() {
    return 'created';
  }

  @Get('/set-header')
  @SetHeader('x-powered-by', 'midway-hono')
  async setHeader() {
    return 'ok';
  }

  @Get('/empty')
  async emptyResponse() {
    return undefined;
  }
}
