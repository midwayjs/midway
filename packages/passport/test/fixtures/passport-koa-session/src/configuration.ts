import { Configuration, App, Provide } from '@midwayjs/decorator';
import * as path from 'path';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import * as LocalStrategy from 'passport-local';
import { PassportMiddleware, PassportStrategy, CustomStrategy as Strategy } from '../../../../src';
import * as passport from 'passport';

@Strategy()
export class CustomStrategy extends PassportStrategy(LocalStrategy.Strategy, 'local') {

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
      password: '123'
    });
  }
}

@Provide()
export class AuthMiddleware extends PassportMiddleware(CustomStrategy) {
  getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
    return {
      successRedirect: '/',
      failureRedirect: '/login'
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
    this.app.keys = ["21321312"];
    this.app.use(session({key: "SESSIONID"}, this.app))
    this.app.use(bodyParser())
    this.app.use(await this.app.generateMiddleware(AuthMiddleware));
  }
}
