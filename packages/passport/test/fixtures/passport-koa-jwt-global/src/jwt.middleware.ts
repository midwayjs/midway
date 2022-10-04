import { PassportMiddleware } from '../../../../src';
import { Middleware } from '@midwayjs/core';
import { JwtStrategy } from './jwt.strategy';
import * as passport from 'passport';

@Middleware()
export class JwtPassportMiddleware extends PassportMiddleware(JwtStrategy) {
  getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
    return {};
  }

  ignore(ctx) {
    return ctx.path === '/gen-jwt';
  }
}
