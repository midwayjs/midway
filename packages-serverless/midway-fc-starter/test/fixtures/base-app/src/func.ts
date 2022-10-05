import { Provide, ServerlessTrigger, ServerlessTriggerType, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';
import { deepStrictEqual } from 'assert';

@Provide()
export class FunctionService {

  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  async event(event) {
    return 'hello world';
  }

  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, {
    path: '/apigw',
    method: 'post',
  })
  async apigw() {
    deepStrictEqual(this.ctx.logger, console);
    deepStrictEqual(this.ctx.path, '/test');
    deepStrictEqual(this.ctx.method, 'POST');
    this.ctx.status = 200;
    this.ctx.set('set-cookie', [
      'bbbb=123; path=/; httponly',
      'ccc=321; path=/; httponly',
    ]);
    this.ctx.body = {
      headers: this.ctx.headers,
      method: this.ctx.method,
      path: this.ctx.path,
      body: this.ctx.request.body,
      params: this.ctx.params,
    };
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/http',
    method: 'get'
  })
  async http() {
    this.ctx.body = 'Alan|' + this.ctx.originContext.requestId;
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/http_302',
    method: 'get'
  })
  async http_302() {
    this.ctx.status = 302;
    this.ctx.set('Location', 'https://github.com/midwayjs/midway');
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/http_json',
    method: 'get'
  })
  async http_json() {
    this.ctx.body = {
      name: 'Alan',
    };
  }

}
