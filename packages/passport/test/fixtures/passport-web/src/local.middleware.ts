import { PassportMiddleware, AuthenticateOptions } from '../../../../src';
import { Middleware } from '@midwayjs/core';
import { CustomStrategy } from './local.strategy';

@Middleware()
export class AuthMiddleware extends PassportMiddleware(CustomStrategy) {
  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {
      failureRedirect: '/login'
    }
  }
}
