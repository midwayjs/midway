import { PassportMiddleware } from '../../../../src';
import { Middleware } from '@midwayjs/decorator';
import * as passport from 'passport';
import { CustomStrategy } from './local.strategy';

@Middleware()
export class AuthMiddleware extends PassportMiddleware(CustomStrategy) {
  async authz(user, info, status): Promise<Record<string, any>> {
    return user;
  }

  getAuthenticateOptions():
    | Promise<passport.AuthenticateOptions>
    | passport.AuthenticateOptions {
    return {
      successRedirect: '/',
      failureRedirect: '/login',
    };
  }
}
