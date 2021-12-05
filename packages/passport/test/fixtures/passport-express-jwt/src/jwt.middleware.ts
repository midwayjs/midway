import { PassportMiddleware } from '../../../../src';
import { Provide } from '@midwayjs/decorator';
import { JwtStrategy } from './jwt.strategy';
import * as passport from 'passport';

@Provide()
export class JwtPassportMiddleware extends PassportMiddleware(JwtStrategy) {
  getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
    return {};
  }
}
