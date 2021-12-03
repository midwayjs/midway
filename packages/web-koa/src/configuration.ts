import {
  Configuration,
  Init,
  Inject,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { extractKoaLikeValue, MidwayDecoratorService } from '@midwayjs/core';

@Configuration({
  namespace: 'koa',
  importConfigs: [
    {
      default: {
        koa: {
          keys: [],
          onerror: {},
        },
      },
    },
  ],
})
export class KoaConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  init() {
    this.decoratorService.registerParameterHandler(
      WEB_ROUTER_PARAM_KEY,
      options => {
        return extractKoaLikeValue(
          options.metadata.type,
          options.metadata.propertyData,
          options.originParamType
        )(options.originArgs[0], options.originArgs[1]);
      }
    );
  }

  async onReady() {}
}
