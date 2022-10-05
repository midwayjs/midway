import {
  Configuration,
  Init,
  Inject,
  WEB_ROUTER_PARAM_KEY,
  extractKoaLikeValue,
  MidwayConfigService,
  MidwayDecoratorService,
} from '@midwayjs/core';
import * as session from '@midwayjs/session';
import { MidwayKoaFramework } from './framework';
import * as DefaultConfig from './config/config.default';
import { BodyParserMiddleware } from './middleware/bodyparser.middleware';
import { SiteFileMiddleware } from './middleware/fav.middleware';

@Configuration({
  namespace: 'koa',
  imports: [session],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class KoaConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  @Inject()
  koaFramework: MidwayKoaFramework;

  @Inject()
  configService: MidwayConfigService;

  @Init()
  init() {
    // register param decorator
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

  async onReady() {
    this.koaFramework.useMiddleware([SiteFileMiddleware, BodyParserMiddleware]);
  }
}
