import { Config, Inject, Provide, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @Config()
  testConfig;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/hello'})
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
