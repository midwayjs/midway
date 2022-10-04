import { Configuration, App, Provide } from '@midwayjs/core';
import * as path from 'path';
import * as LocalStrategy from 'passport-local';
import {
  PassportMiddleware,
  PassportStrategy,
  CustomStrategy as Strategy,
  AuthenticateOptions,
} from '../../../../src';
import * as koa from '@midwayjs/koa';

@Strategy()
export class CustomStrategy extends PassportStrategy(
  LocalStrategy.Strategy,
  'local'
) {
  getStrategyOptions(): any {
    return {};
  }

  validate(username, password): any {
    return { username, password };
  }
}

@Provide()
export class AuthMiddleware extends PassportMiddleware(CustomStrategy) {
  getAuthenticateOptions():
    | Promise<AuthenticateOptions>
    | AuthenticateOptions {
    return {
    };
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
