import {
  Configuration,
  Init,
  Inject,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { MidwayKoaFramework } from './framework';
import { extractKoaLikeValue, MidwayDecoratorService } from '@midwayjs/core';

@Configuration({
  namespace: 'koa',
})
export class KoaConfiguration {
  @Inject()
  framework: MidwayKoaFramework;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  init() {
    this.decoratorService.registerParameterHandler(
      WEB_ROUTER_PARAM_KEY,
      options => {
        return extractKoaLikeValue(
          options.metadata.type,
          options.metadata.propertyData
        )(options.originArgs[0], options.originArgs[1]);
      }
    );
  }

  async onReady() {}

  async onServerReady() {
    await this.framework.run();
  }
}
