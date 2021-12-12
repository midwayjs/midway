import { Config, Inject, Logger, Middleware } from '@midwayjs/decorator';
import {
  IMiddleware,
  MidwayConfigMissingError,
  MidwayConfigService,
} from '@midwayjs/core';
import * as session from 'express-session';
import * as cookieSession from 'cookie-session';
import { SessionStoreManager } from '../store';

@Middleware()
export class SessionMiddleware implements IMiddleware<any, any> {
  @Config('session')
  sessionConfig;

  @Logger()
  logger;

  @Inject()
  sessionStoreManager: SessionStoreManager;

  @Inject()
  configService: MidwayConfigService;

  resolve() {
    if (this.sessionConfig.enable) {
      const secret =
        this.sessionConfig.secret ??
        this.configService.getConfiguration('express.keys') ??
        this.configService.getConfiguration('keys');
      if (!secret) {
        throw new MidwayConfigMissingError('config.session.secret');
      }
      this.sessionConfig.secret = [].concat(secret);
      if (!this.sessionConfig.cookie.httpOnly) {
        this.logger.warn(
          '[midway-session]: please set `config.session.cookie.httpOnly` to true. It is very dangerous if session can read by client JavaScript.'
        );
      }
      const store = this.sessionStoreManager.getSessionStore(session);
      if (store) {
        this.sessionConfig.store = store;
      }
      if (!this.sessionConfig.store) {
        return cookieSession(
          Object.assign(this.sessionConfig.cookie, {
            keys: this.sessionConfig.secret,
            name: this.sessionConfig.name,
          })
        );
      } else {
        return session(this.sessionConfig);
      }
    }
  }
}
