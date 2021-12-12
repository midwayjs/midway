import { App, Configuration, Provide } from '@midwayjs/decorator';
import * as passport from 'passport';
import { PassportMiddleware, PassportStrategy, CustomStrategy as Strategy } from '../../../../src';
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

@Provide('local')
export class AuthMiddleware extends PassportMiddleware(CustomStrategy) {

  getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
    return {
      successRedirect: '/',
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
    this.app.useMiddleware(AuthMiddleware);
  }
}
