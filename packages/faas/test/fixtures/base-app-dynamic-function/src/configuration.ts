import { Configuration, App, Inject, ServerlessTriggerType } from '@midwayjs/core';
import { MidwayServerlessFunctionService } from '@midwayjs/core';

@Configuration({
  importConfigs: [
  ],
})
export class AutoConfiguration {
  @App()
  app;

  @Inject()
  serverlessFunctionService: MidwayServerlessFunctionService;

  async onConfigLoad() {
    this.serverlessFunctionService.addServerlessFunction(async (ctx) => {
      return 'hello world,' + ctx.query['name'];
    }, {
      handlerName: 'index.handler',
      functionName: 'index',
      type: ServerlessTriggerType.HTTP,
      metadata: {
        path: '/api/user',
        method: 'get',
      }
    });

    this.serverlessFunctionService.addServerlessFunction(async (ctx) => {
      return 'hello world,' + ctx.params['userId'];
    }, {
      handlerName: 'user.handler',
      functionName: 'index2',
      type: ServerlessTriggerType.HTTP,
      metadata: {
        path: '/api/user/:userId',
        method: 'get',
      }
    });

    this.serverlessFunctionService.addServerlessFunction(async (ctx) => {
      return 'hello world,' + ctx.request.body['userId'];
    }, {
      handlerName: 'user_push.handler',
      functionName: 'index3',
      type: ServerlessTriggerType.HTTP,
      metadata: {
        path: '/api/user',
        method: 'post',
      }
    });

    this.serverlessFunctionService.addServerlessFunction(async (ctx, event) => {
      return event.text + 'hello world';
    }, {
      handlerName: 'event.handler',
      functionName: 'index2',
      type: ServerlessTriggerType.EVENT,
      metadata: {}
    });
  }
}
