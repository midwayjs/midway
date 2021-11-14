import {
  Configuration,
  Init,
  Inject,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { MidwayExpressFramework } from './framework';
import {
  extractExpressLikeValue,
  MidwayDecoratorService,
} from '@midwayjs/core';

@Configuration({
  namespace: 'express',
})
export class ExpressConfiguration {
  @Inject()
  framework: MidwayExpressFramework;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  init() {
    this.decoratorService.registerParameterHandler(
      WEB_ROUTER_PARAM_KEY,
      options => {
        return extractExpressLikeValue(
          options.metadata.type,
          options.metadata.propertyData
        )(options.originArgs[0], options.originArgs[1], options.originArgs[2]);
      }
    );
  }

  async onReady() {}

  async onServerReady() {
    await this.framework.run();
  }
}
