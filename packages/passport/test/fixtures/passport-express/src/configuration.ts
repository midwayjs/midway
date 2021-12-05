import { App, Configuration, Provide } from '@midwayjs/decorator';
import * as passport from 'passport';
import { PassportMiddleware, PassportStrategy, CustomStrategy } from '../../../../src';
import * as path from 'path';
import * as LocalStrategy from 'passport-local';

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

  getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
    return {
      successRedirect: '/',
      failureRedirect: '/login',
    }
  }
}

@Configuration({
  imports: [
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
