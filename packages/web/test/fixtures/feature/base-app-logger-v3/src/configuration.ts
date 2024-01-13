import { Configuration, Logger } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerLifeCycle {
  @Logger('abc')
  abcLogger;

  @Logger('custom')
  customLogger;

  @Logger()
  appLogger;

  async onReady() {
    this.abcLogger.warn('midway 自定义 logger，应该输出到 abc.log');
    this.customLogger.warn('egg 自定义 logger，应该输出到 custom.log');
    this.appLogger.warn('框架默认的 app 日志，应该输出到 midway-web.log');
  }
}
