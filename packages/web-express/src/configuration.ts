import {
  Configuration,
  extractExpressLikeValue,
  Init,
  Inject,
  MidwayConfigService,
  MidwayDecoratorService,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/core';
import * as session from '@midwayjs/express-session';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as DefaultConfig from './config/config.default';
import { MidwayExpressFramework } from './framework';

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
    const keys =
      this.configService.getConfiguration('express.keys') ??
      this.configService.getConfiguration('keys');
    const cookieParserConfig =
      this.configService.getConfiguration('cookieParser');

    if (cookieParserConfig.enable) {
      // add cookie parser middleware
      this.expressFramework
        .getMiddleware()
        .insertFirst(
          cookieParser(
            cookieParserConfig.secret ?? keys,
            cookieParserConfig.options
          )
        );
    }

    // add body parser
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
