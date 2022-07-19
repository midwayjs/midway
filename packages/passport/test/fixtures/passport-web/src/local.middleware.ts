import { PassportMiddleware } from '../../../../src';
import { Middleware } from '@midwayjs/decorator';
import * as passport from 'passport';
import { CustomStrategy } from './local.strategy';

@Middleware()
export class AuthMiddleware extends PassportMiddleware(CustomStrategy) {
  getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
    return {
      failureRedirect: '/login'
    }
  }
}
