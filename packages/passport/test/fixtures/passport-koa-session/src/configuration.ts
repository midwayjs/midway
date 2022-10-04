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

  // serializeUser 在用户登录验证成功以后将会把用户的数据存储到 session 中
  serializeUser(user, done) {
    done(null, user.username);
  }

  // deserializeUser 在每次请求的时候将从 session 中读取用户对象
  deserializeUser(user, done) {
    done(null, {
      username: 'admin',
      password: '123',
    });
  }
}

@Provide()
export class AuthMiddleware extends PassportMiddleware(CustomStrategy) {
  getAuthenticateOptions():
    | Promise<AuthenticateOptions>
    | AuthenticateOptions {
    return {
      failureRedirect: '/login',
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
