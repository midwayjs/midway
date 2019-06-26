import { provide } from 'injection';
import { controller, config, get, post, query, param, ctx, files, file, session, body, headers } from '../../../../../../../src';
import * as path from 'path';
import * as fs from 'fs';

import * as pump from 'mz-modules/pump';

@provide()
@controller('/param')
export class ParamController {

  @config('baseDir')
  baseDir: string;

  @get('/query')
  async query(@query() query, @ctx() ctx) {
      ctx.body = query;
  }

  @get('/query_id')
  async queryId(@query('id') id, @ctx() ctx) {
    ctx.body = id;
  }

  @get('/param/:id/test/:userId')
  async param(@param() param, @ctx() ctx) {
    // service,hello,a,b
    ctx.body = param;
  }

  @get('/param/:id')
  async paramId(@param('id') id, @ctx() ctx) {
    ctx.body = id;
  }

  @post('/body')
  async body(@body() body, @ctx() ctx) {
    ctx.body = body;
  }

  @get('/body_id')
  async bodyId(@body('id') id, @ctx() ctx) {
    ctx.body = id;
  }

  @post('/file')
  async file(@file() stream, @ctx() ctx) {
    const filename = encodeURIComponent(stream.fields.name) + path.extname(stream.filename).toLowerCase();
    const target = path.join(this.baseDir, 'app/public', filename);
    const writeStream = fs.createWriteStream(target);
    await pump(stream, writeStream);
    ctx.body = 'ok';
  }

  @post('/files')
  async files(@files({ autoFields: true }) parts, @ctx() ctx) {

    let stream = await parts();

    while (stream) {
        const filename = stream.filename.toLowerCase();
        const target = path.join(this.baseDir, 'app/public', filename);
        const writeStream = fs.createWriteStream(target);
        await pump(stream, writeStream);
        stream = await parts();
    }

    ctx.body = 'ok';
  }

  @get('/session')
  async session(@session() session, @ctx() ctx) {
    // service,hello,a,b
    ctx.body = session;
  }

  @get('/headers')
  async header(@headers() headers, @ctx() ctx) {
    // service,hello,a,b
    ctx.body = headers.host.substring(0, 3);
  }

  @get('/headers_host')
  async headerHost(@headers('host') host, @ctx() ctx) {
    // service,hello,a,b
    ctx.body = host.substring(0, 3);
  }

}
