import {
  App,
  Configuration,
  Inject,
  Init,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { IMidwayWebApplication } from './interface';
import {
  extractKoaLikeValue,
  HTTP_SERVER_KEY,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { join } from 'path';
import { MidwayWebFramework } from './framework/web';

@Configuration({
  namespace: 'egg',
  importConfigs: [join(__dirname, 'config')],
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

  @Inject()
  framework: MidwayWebFramework;

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
    // ps: 本想在这里清理掉egg添加的中间件，但是这里的数组已经只有一个 midway root middleware，其他的 getter 都是 egg 加进去的，但是不会被中间件执行，所以不需要清理
    // 去掉为了 egg-socket.io 报错扫进去的 session
    this.app.middleware =
      Array.isArray(this.app.middleware) && this.app.middleware.length
        ? this.app.middleware.slice()
        : [];
  }

  async onServerReady(container) {
    // trigger server didReady
    this.app.messenger.emit('egg-ready');

    if (process.env['EGG_CLUSTER_MODE'] === 'true') {
      this.app.once('server', server => {
        this.framework.setServer(server);
        // register httpServer to applicationContext
        container.registerObject(HTTP_SERVER_KEY, server);
      });
    }
  }

  async onStop() {
    // TODO flush egg logger and close it
  }
}
