import { PassportMiddleware, AuthenticateOptions } from '../../../../src';
import { Provide } from '@midwayjs/core';
import { JwtStrategy } from './jwt.strategy';

@Provide()
export class JwtPassportMiddleware extends PassportMiddleware(JwtStrategy) {
  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {};
  }
}
