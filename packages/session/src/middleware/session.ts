import { Config, Inject, Logger, Middleware } from '@midwayjs/decorator';
import * as koaSession from 'koa-session';
import { IMiddleware } from '@midwayjs/core';
import { SessionStoreManager } from '../store';

@Middleware()
export class SessionMiddleware implements IMiddleware<any, any> {
  @Config('session')
  sessionConfig;

  @Logger()
  logger;

  @Inject()
  sessionStoreManager: SessionStoreManager;

  resolve(app) {
    if (!this.sessionConfig.httpOnly) {
      this.logger.warn(
        '[midway-session]: please set `config.session.httpOnly` to true. It is very dangerous if session can read by client JavaScript.'
      );
    }
    const store = this.sessionStoreManager.getSessionStore();
    if (store) {
      this.sessionConfig.store = store;
    }
    return koaSession(this.sessionConfig, app) as any;
  }
}
