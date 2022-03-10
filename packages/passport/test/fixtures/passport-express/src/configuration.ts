import { App, Configuration, Provide } from '@midwayjs/decorator';
import * as passport from 'passport';
import { PassportMiddleware, PassportStrategy, CustomStrategy } from '../../../../src';
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

  async authz(user, info, status): Promise<Record<string, any>> {
    return user
  }

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
    // this.app.use(await this.app.generateMiddleware(AuthMiddleware));
  }
}
