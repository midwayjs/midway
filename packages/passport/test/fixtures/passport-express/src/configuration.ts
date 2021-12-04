import { App, Configuration, Provide } from '@midwayjs/decorator';
import * as passport from 'passport';
import { PassportMiddleware, PassportStrategy, Strategy } from '../../../../src';
import * as path from 'path';
import * as LocalStrategy from 'passport-local';

@Strategy()
export class CustomStrategy extends PassportStrategy(LocalStrategy.Strategy) {

  getStrategyConfig(): any {
    return {};
  }

  validate(username, password): any {
    return { username, password };
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
