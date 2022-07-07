import { Configuration, App, Inject, ServerlessTriggerType } from '@midwayjs/decorator';
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
