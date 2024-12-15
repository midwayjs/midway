import { MainApp, Configuration, Middleware } from '@midwayjs/core';
import { PassportMiddleware, PassportStrategy, CustomStrategy as Strategy, AuthenticateOptions } from '../../../../src';
import * as path from 'path';
import * as LocalStrategy from 'passport-local';
import * as express from '@midwayjs/express';

@Strategy()
export class CustomStrategy extends PassportStrategy(LocalStrategy.Strategy) {

  getStrategyOptions(): any {
    return {};
  }

  validate(username, password): any {
    return { username, password };
  }

  serializeUser(user, done) {
    done(null, user.username);
  }

  deserializeUser(id, done) {
    done(null, {
      username: 'admin',
      password: '123'
    });
  }
}

@Middleware()
export class AuthMiddleware extends PassportMiddleware(CustomStrategy) {

  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {
      failureRedirect: '/login',
    }
  }
}

@Configuration({
  imports: [
    express,
    require('../../../../src')
  ],
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {

  @MainApp()
  app;

  async onReady() {
    this.app.useMiddleware(AuthMiddleware);
  }
}
