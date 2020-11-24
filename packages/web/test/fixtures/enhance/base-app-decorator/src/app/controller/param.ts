import { Provide, Inject, Controller, Config, Get, Post, Query, Param, Files, File, Session, Body, Headers } from '@midwayjs/decorator';
import { ALL } from '@midwayjs/decorator';

import * as path from 'path';
import * as fs from 'fs';

import * as pump from 'mz-modules/pump';

@Provide()
@Controller('/param')
export class ParamController {

  @Config('baseDir')
  baseDir: string;

  @Inject()
  ctx: any;

  @Get('/query')
  async query(@Query(ALL) query) {
    this.ctx.body = query;
  }

  @Get('/:id/test')
  async test(@Query(ALL) query, @Param('id') id) {
    const data = {
        id,
        ...query
      };
    this.ctx.body = data;
  }

  @Get('/query_id')
  async queryId(@Query('id') id) {
    this.ctx.body = id;
  }

  @Get('/param/:id/test/:userId')
  async param(@Param(ALL) param) {
    // service,hello,a,b
    this.ctx.body = param;
  }

  @Get('/param/:id')
  async paramId(@Param('id') id) {
    this.ctx.body = id;
  }

  @Post('/body')
  async body(@Body(ALL) body) {
    this.ctx.body = body;
  }

  @Get('/body_id')
  async bodyId(@Body('id') id) {
    this.ctx.body = id;
  }

  @Post('/file')
  async file(@File() stream) {
    const filename = encodeURIComponent(stream.fields.name) + path.extname(stream.filename).toLowerCase();
    const target = path.join(this.baseDir, 'app/public', filename);
    const writeStream = fs.createWriteStream(target);
    await pump(stream, writeStream);
    this.ctx.body = 'ok';
  }

  @Post('/files')
  async files(@Files({ autoFields: true }) parts) {

    let stream = await parts();

    while (stream) {
        const filename = stream.filename.toLowerCase();
        const target = path.join(this.baseDir, 'app/public', filename);
        const writeStream = fs.createWriteStream(target);
        await pump(stream, writeStream);
        stream = await parts();
    }

    this.ctx.body = 'ok';
  }

  @Get('/session')
  async session(@Session(ALL) session) {
    // service,hello,a,b
    this.ctx.body = session;
  }

  @Get('/headers')
  async header(@Headers(ALL) headers) {
    // service,hello,a,b
    this.ctx.body = headers.host.substring(0, 3);
  }

  @Get('/headers_host')
  async headerHost(@Headers('host') host) {
    // service,hello,a,b
    this.ctx.body = host.substring(0, 3);
  }

}
