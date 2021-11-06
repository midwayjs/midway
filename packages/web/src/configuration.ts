import {
  App,
  Configuration,
  Inject,
  Init,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { IMidwayWebApplication } from './interface';
import { MidwayWebFramework } from './framework/web';
import { extractKoaLikeValue, MidwayDecoratorService } from '@midwayjs/core';
import { debuglog } from 'util';
const debug = debuglog('midway:egg');

@Configuration({
  namespace: 'egg',
  importConfigs: [
    {
      test: {
        egg: {
          plugins: {
            'egg-mock': {
              enable: true,
              package: 'egg-mock',
            },
          },
        },
      },
      unittest: {
        egg: {
          plugins: {
            'egg-mock': {
              enable: true,
              package: 'egg-mock',
            },
          },
        },
      },
    },
  ],
})
export class EggConfiguration {
  @Inject()
  baseDir;

  @Inject()
  appDir;

  @App()
  app: IMidwayWebApplication;

  @Inject()
  webFramework: MidwayWebFramework;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  init() {
    debug('lifecycle: init');
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

  async onReady(container) {
    debug('lifecycle: onReady');
  }

  async onServerReady() {
    debug('lifecycle: onServerReady(framework run)');
    // trigger server didReady
    await this.webFramework.run();
    this.app.messenger.emit('egg-ready');
  }
}
