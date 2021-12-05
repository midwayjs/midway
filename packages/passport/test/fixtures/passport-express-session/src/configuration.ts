import { App, Configuration, Provide } from '@midwayjs/decorator';
import * as passport from 'passport';
import { PassportMiddleware, PassportStrategy, CustomStrategy as Strategy } from '../../../../src';
import * as path from 'path';
import * as LocalStrategy from 'passport-local';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';

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
    require('../../../../src')
  ],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, 'config')],
})
export class ContainerLifeCycle {

  @App()
  app;

  async onReady() {
    this.app.use(
      session({
        secret: 'my-secret',
        resave: true,
        saveUninitialized: true,
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(await this.app.generateMiddleware(AuthMiddleware));
  }
}
