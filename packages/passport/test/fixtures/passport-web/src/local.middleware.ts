import { PassportMiddleware } from '../../../../src';
import { Provide } from '@midwayjs/decorator';
import * as passport from 'passport';
import { CustomStrategy } from './local.strategy';

@Provide('local')
export class AuthMiddleware extends PassportMiddleware(CustomStrategy) {
  getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
    return {
      successRedirect: '/',
      failureRedirect: '/login'
    }
  }
}
