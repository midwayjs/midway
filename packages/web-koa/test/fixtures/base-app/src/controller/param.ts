import {
  Get,
  Provide,
  Controller,
  Inject,
  Query,
  Queries,
  ALL,
  Body,
  Param,
  Headers,
  Session,
  RequestPath,
  RequestIP,
  Post,
} from '@midwayjs/decorator';

@Provide()
@Controller('/param')
export class ParamController {

  @Inject()
  ctx;

  @Get('/param_query')
  async param_query(@Query() name: string) {
    return name;
  }

  @Get('/param_query_all')
  async param_query_all(@Query(ALL) query) {
    return query;
  }

  @Get('/param_queries')
  async param_queries(@Queries() name: string) {
    return name;
  }

  @Get('/param_queries_all')
  async param_queries_all(@Queries(ALL) name: string) {
    return name;
  }

  @Post('/param_body')
  async param_body(@Body() name: string) {
    return name;
  }

  @Post('/param_body_all')
  async param_body_All(@Body(ALL) name: string) {
    return name;
  }

  @Get('/param/:name')
  async param_param(@Param() name: string) {
    return name;
  }

  @Get('/headers')
  async param_headers(@Headers() name: string) {
    return name;
  }

  @Get('/session')
  async param_session(@Session() name: string) {
    return name;
  }

  @Get('/set_session')
  async setSession() {
    this.ctx.session['name'] = 'harry';
  }

  @Get('/request_path')
  async param_request_path(@RequestPath() p: string) {
    return p;
  }

  @Get('/request_ip')
  async param_request_ip(@RequestIP() ip: string) {
    return ip;
  }

}
