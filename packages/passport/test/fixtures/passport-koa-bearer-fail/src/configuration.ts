import { Configuration, MainApp, Provide } from '@midwayjs/core';
import * as path from 'path';
import * as HttpBearerStrategy from 'passport-http-bearer';
import {
  PassportMiddleware,
  PassportStrategy,
  CustomStrategy as Strategy,
  AuthenticateOptions,
} from '../../../../src';
import * as koa from '@midwayjs/koa';

@Strategy()
export class BearerStrategy extends PassportStrategy(
  HttpBearerStrategy.Strategy,
  'bearer'
) {
  getStrategyOptions(): any {
    return this.validate.bind(this);
  }

  validate(token, done): any {
    // return { username, password };
    done(null);
  }
}

@Provide()
export class AuthMiddleware extends PassportMiddleware(BearerStrategy) {
  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {};
  }
}

@Configuration({
  imports: [koa, require('../../../../src')],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {
  @MainApp()
  app;

  async onReady() {
    this.app.useMiddleware(AuthMiddleware);
  }
}
