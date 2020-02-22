import * as path from 'path';
import * as fs from 'fs';

import { provide, inject } from 'injection';
import * as pump from 'mz-modules/pump';

import {
  // eslint-disable-next-line import/named
  controller, config, get, post, query, param, files, file, session, body, headers,
} from '../../../../../../../src';

@provide()
@controller('/param')
export class ParamController {

  @config('baseDir')
  baseDir: string;

  @inject()
  ctx: any;

  @get('/query')
  async query(@query('query') queryInput) {
    this.ctx.body = queryInput;
  }

  @get('/:id/test')
  async test(@query('query') queryInput, @param('id') id) {
    const data = {
      id,
      ...queryInput,
    };
    this.ctx.body = data;
  }

  @get('/query_id')
  async queryId(@query('id') id) {
    this.ctx.body = id;
  }

  @get('/param/:id/test/:userId')
  async param(@param('param') paramInput) {
    // service,hello,a,b
    this.ctx.body = paramInput;
  }

  @get('/param/:id')
  async paramId(@param('id') id) {
    this.ctx.body = id;
  }

  @post('/body')
  async body(@body('body') bodyInput) {
    this.ctx.body = bodyInput;
  }

  @get('/body_id')
  async bodyId(@body('id') id) {
    this.ctx.body = id;
  }

  @post('/file')
  async file(@file() stream) {
    const filename = encodeURIComponent(stream.fields.name) + path.extname(stream.filename).toLowerCase();
    const target = path.join(this.baseDir, 'app/public', filename);
    const writeStream = fs.createWriteStream(target);
    await pump(stream, writeStream);
    this.ctx.body = 'ok';
  }

  @post('/files')
  async files(@files({ autoFields: true }) parts) {

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

  @get('/session')
  async session(@session('session') sessionInput) {
    // service,hello,a,b
    this.ctx.body = sessionInput;
  }

  @get('/headers')
  async header(@headers('headers') headersInput) {
    // service,hello,a,b
    this.ctx.body = headersInput.host.substring(0, 3);
  }

  @get('/headers_host')
  async headerHost(@headers('host') host) {
    // service,hello,a,b
    this.ctx.body = host.substring(0, 3);
  }

}
