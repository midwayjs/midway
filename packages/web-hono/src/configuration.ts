import {
  Configuration,
  Init,
  Inject,
  MidwayDecoratorService,
  WEB_ROUTER_PARAM_KEY,
  RouteParamTypes,
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
    this.decoratorService.registerParameterHandler(WEB_ROUTER_PARAM_KEY, options => {
      return (ctx, next) => {
        const key = options.metadata.type;
        const data = options.metadata.propertyData;
        switch (key) {
          case RouteParamTypes.NEXT:
            return next;
          case RouteParamTypes.BODY:
            return data ? ctx.requestBody?.[data] : ctx.requestBody;
          case RouteParamTypes.PARAM:
            return data ? ctx.req.param(data) : ctx.req.param();
          case RouteParamTypes.QUERY:
            return data ? ctx.req.query(data) : ctx.req.query();
          case RouteParamTypes.HEADERS:
            return data ? ctx.req.header(data) : ctx.req.raw.headers;
          case RouteParamTypes.REQUEST_PATH:
            return ctx.req.path;
          case RouteParamTypes.REQUEST_IP:
            return ctx.req.header('x-forwarded-for') ?? '';
          default:
            return undefined;
        }
      };
    });
  }

  async onReady() {
    // keep lifecycle compatibility with Midway component loading.
  }
}
