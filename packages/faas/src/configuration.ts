import {
  ApplicationContext,
  Configuration,
  Init,
  Inject,
  LOGGER_KEY,
  PLUGIN_KEY,
  WEB_ROUTER_PARAM_KEY,
  extractKoaLikeValue,
  MidwayDecoratorService,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core';
import { MidwayFaaSFramework } from './framework';
import * as DefaultConfig from './config.default';

@Configuration({
  namespace: 'faas',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class FaaSConfiguration {
  @Inject()
  framework: MidwayFaaSFramework;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @ApplicationContext()
  applicationContext;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      PLUGIN_KEY,
      (key, meta, target) => {
        return (
          target?.[REQUEST_OBJ_CTX_KEY]?.[key] ||
          this.framework.getApplication()[key]
        );
      }
    );

    this.decoratorService.registerPropertyHandler(
      LOGGER_KEY,
      (key, meta, target) => {
        return (
          target?.[REQUEST_OBJ_CTX_KEY]?.['logger'] ||
          this.framework.getLogger()
        );
      }
    );
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

  async onReady(container) {}

  async onServerReady() {
    if (!this.framework.isEnable()) {
      // just in legacy local dev and test
      await this.framework.run();
    }
    await this.framework.loadFunction();
  }
}
