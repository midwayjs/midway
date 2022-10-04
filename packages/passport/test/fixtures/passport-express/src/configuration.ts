import { App, Configuration, Provide } from '@midwayjs/core';
import { PassportMiddleware, PassportStrategy, CustomStrategy, AuthenticateOptions } from '../../../../src';
import * as path from 'path';
import * as LocalStrategy from 'passport-local';
import * as express from '@midwayjs/express';

@CustomStrategy()
export class MyStrategy extends PassportStrategy(LocalStrategy.Strategy) {

  getStrategyOptions(): any {
    return {};
  }

  validate(username, password): any {
    return { username, password };
  }
}

@Provide('local')
export class AuthMiddleware extends PassportMiddleware(MyStrategy) {

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
  conflictCheck: true,
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {

  @App()
  app;

  async onReady() {
    // this.app.use(await this.app.generateMiddleware(AuthMiddleware));
  }
}
