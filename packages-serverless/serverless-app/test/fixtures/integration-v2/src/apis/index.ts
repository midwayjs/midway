import { provide, func, inject, config } from '@midwayjs/faas';
import * as assert from 'assert';

@provide()
export class HelloHttpService {
  @inject()
  ctx;

  @config()
  testConfig;

  @func('http.handler', { event: 'http', path: '/hello'})
  async handler() {
    assert(this.testConfig.name === 'test');
    return {
      method: this.ctx.method,
      path: this.ctx.path,
      headers: this.ctx.headers,
      query: this.ctx.query,
      body: this.ctx.request.body,
    }
  }
}
