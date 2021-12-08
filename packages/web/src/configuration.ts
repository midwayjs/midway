import {
  App,
  Configuration,
  Inject,
  Init,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { IMidwayWebApplication } from './interface';
import { extractKoaLikeValue, MidwayDecoratorService } from '@midwayjs/core';

@Configuration({
  namespace: 'egg',
  importConfigs: [
    {
      default: {
        midwayLogger: {
          clients: {
            appLogger: {
              fileLogName: 'midway-web.log',
              aliasName: 'logger',
            },
            agentLogger: {
              fileLogName: 'midway-agent.log',
            },
          },
        },
        egg: {
          dumpConfig: true,
        },
      },
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

  async onReady() {
    // 在这里清理掉 app.middleware 的内容，因为已经加到 middlewareManager 中了
    // ps: 其实这里的数组本来就只有一个方法，其他的 getter 都是 egg 加进去的，但是不会被中间件执行，所以不需要清理
    // if (this.app.middleware) {
    //   this.app.middleware = this.app.middleware.slice(0);
    // }
  }

  async onServerReady() {
    // trigger server didReady
    this.app.messenger.emit('egg-ready');
  }

  async onStop() {
    // TODO flush egg logger and close it
  }
}
