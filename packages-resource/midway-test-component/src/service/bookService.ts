import { Provide, Inject } from '@midwayjs/core';
import * as crypto from 'crypto';

@Provide()
export class BookService {
  @Inject()
  ctx;

  rid = crypto.randomBytes(16).toString('hex');

  async getBookById() {
    return {
      data: 'hello world',
      query: this.ctx.query,
      randomId: this.rid,
    };
  }
}
