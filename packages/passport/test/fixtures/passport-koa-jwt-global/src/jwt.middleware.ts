import { PassportMiddleware, AuthenticateOptions } from '../../../../src';
import { Middleware } from '@midwayjs/core';
import { JwtStrategy } from './jwt.strategy';

@Middleware()
export class JwtPassportMiddleware extends PassportMiddleware(JwtStrategy) {
  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {};
  }

  ignore(ctx) {
    return ctx.path === '/gen-jwt';
  }
}
