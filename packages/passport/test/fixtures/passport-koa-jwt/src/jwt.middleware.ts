import { PassportMiddleware } from '../../../../src';
import { Middleware } from '@midwayjs/decorator';
import { JwtStrategy } from './jwt.strategy';
import * as passport from 'passport';

@Middleware()
export class JwtPassportMiddleware extends PassportMiddleware(JwtStrategy) {
  async authz(user, info, status): Promise<Record<string, any>> {
    return user;
  }

  getAuthenticateOptions():
    | Promise<passport.AuthenticateOptions>
    | passport.AuthenticateOptions {
    return {};
  }
}
