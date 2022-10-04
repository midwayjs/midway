import { Configuration, App, Provide } from '@midwayjs/core';
import * as path from 'path';
import { Strategy } from 'passport-openidconnect';

import {
  PassportMiddleware,
  PassportStrategy,
  CustomStrategy,
} from '../../../../src';
import * as koa from '@midwayjs/koa';

@CustomStrategy()
export class CRCCStrategy extends PassportStrategy(Strategy, 'crcc') {
  async validate(...payload) {
    return payload;
  }
  getStrategyOptions() {
    return {
      issuer: 'https://g1openid.crcc.cn',
      userInfoURL: 'https://g1openid.crcc.cn/oauth/userinfo',
      clientID: 'test',
      clientSecret: 'abcdefg_test',
      authorizationURL: 'https://g1openid.crcc.cn/oauth/authorize',
      tokenURL: 'https://g1openid.crcc.cn/oauth/token',
      callbackURL: 'http://127.0.0.1:8081/redirect',
      returnURL: 'http://127.0.0.1:8081/redirect',
      scope: 'profile',
    };
  }
}


@Provide()
export class AuthMiddleware extends PassportMiddleware(CRCCStrategy) {
  getAuthenticateOptions(): any {
    return { failureRedirect: '/redirect' };
  }
}

@Configuration({
  imports: [koa, require('../../../../src')],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {
  @App()
  app;

  async onReady() {
    this.app.useMiddleware(AuthMiddleware);
  }
}
