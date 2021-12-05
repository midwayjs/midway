import { PassportStrategy, CustomStrategy as Strategy } from '../../../../src';
import * as LocalStrategy from 'passport-local';

@Strategy()
export class CustomStrategy extends PassportStrategy(LocalStrategy.Strategy, 'local') {

  getStrategyConfig(): any {
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
