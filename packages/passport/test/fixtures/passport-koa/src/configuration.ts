import { Configuration, App } from '@midwayjs/decorator';
// import * as passport from '../../../../src';
import * as path from 'path';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import * as LocalStrategy from 'passport-local';
const passport = require('../../../../src/proxy/');

// 用户名密码验证策略
passport.use(new LocalStrategy.Strategy(
  /**
   * @param username 用户输入的用户名
   * @param password 用户输入的密码
   * @param done 验证验证完成后的回调函数，由passport调用
   */
  function (username, password, done) {
    return done(null, { name: username });
  }
))

// serializeUser 在用户登录验证成功以后将会把用户的数据存储到 session 中
passport.serializeUser(function (user, done) {
  done(null, user)
})

// deserializeUser 在每次请求的时候将从 session 中读取用户对象
passport.deserializeUser(function (user, done) {
  return done(null, user)
})

@Configuration({
  // imports: [passport],
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
    this.app.use(passport.initialize())
    this.app.use(passport.session())
    this.app.use(async (ctx, next) => {
      if (ctx.state.user) {
        await next();
      } else {
        passport.authenticate('local', {
          successRedirect: '/',
          failureRedirect: '/login'
        })(ctx, next);
      }
    });
  }
}
