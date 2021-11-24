import {
  Configuration,
  Init,
  Inject,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import {
  extractExpressLikeValue,
  MidwayDecoratorService,
} from '@midwayjs/core';

@Configuration({
  namespace: 'express',
})
export class ExpressConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  init() {
    this.decoratorService.registerParameterHandler(
      WEB_ROUTER_PARAM_KEY,
      options => {
        return extractExpressLikeValue(
          options.metadata.type,
          options.metadata.propertyData,
          options.originParamType
        )(options.originArgs[0], options.originArgs[1], options.originArgs[2]);
      }
    );
  }

  async onReady() {}
}
