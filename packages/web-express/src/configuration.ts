import {
  Configuration,
  Init,
  Inject,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import {
  extractExpressLikeValue,
  MidwayConfigService,
  MidwayDecoratorService,
} from '@midwayjs/core';
import * as session from '@midwayjs/express-session';
import { MidwayExpressFramework } from './framework';
import * as bodyParser from 'body-parser';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'express',
  imports: [session],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class ExpressConfiguration {
  @Inject()
  decoratorService: MidwayDecoratorService;

  @Inject()
  expressFramework: MidwayExpressFramework;

  @Inject()
  configService: MidwayConfigService;

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

  async onReady() {
    const bodyparserConfig = this.configService.getConfiguration('bodyParser');
    if (bodyparserConfig.enable) {
      // create application/json parser
      if (bodyparserConfig.json.enable) {
        this.expressFramework.useMiddleware(
          bodyParser.json(bodyparserConfig.json)
        );
      }
      if (bodyparserConfig.raw.enable) {
        this.expressFramework.useMiddleware(
          bodyParser.raw(bodyparserConfig.raw)
        );
      }
      if (bodyparserConfig.text.enable) {
        this.expressFramework.useMiddleware(
          bodyParser.text(bodyparserConfig.text)
        );
      }
      // create application/x-www-form-urlencoded parser
      if (bodyparserConfig.urlencoded.enable) {
        this.expressFramework.useMiddleware(
          bodyParser.urlencoded(bodyparserConfig.urlencoded)
        );
      }
    }
  }
}
