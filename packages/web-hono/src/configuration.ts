import {
  Configuration,
  Init,
  Inject,
  MidwayDecoratorService,
  WEB_ROUTER_PARAM_KEY,
  extractExpressLikeValue,
} from '@midwayjs/core';
import { MidwayHonoFramework } from './framework';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'hono',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class HonoConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  @Inject()
  honoFramework: MidwayHonoFramework;

  @Init()
  init() {
    // Reuse core express-like extractor to keep decorator behavior consistent.
    this.decoratorService.registerParameterHandler(
      WEB_ROUTER_PARAM_KEY,
      options => {
        return extractExpressLikeValue(
          options.metadata.type,
          options.metadata.propertyData,
          options.originParamType
        )(
          options.originArgs[0],
          options.originArgs[1],
          options.originArgs[2]
        );
      }
    );
  }

  async onReady() {
    // keep lifecycle compatibility with Midway component loading.
  }
}
