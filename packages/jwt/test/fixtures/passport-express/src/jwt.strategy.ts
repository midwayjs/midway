import {
  BootStrategy,
  ExpressPassportStrategyAdapter,
} from '../../../../../passport/src/';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';

@BootStrategy({
  async useParams({ configuration }): Promise<StrategyOptions> {
    return {
      secretOrKey: configuration.jwt.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };
  },
})
export class JwtStrategy extends ExpressPassportStrategyAdapter(
  Strategy,
  'jwt'
) {
  async verify(payload) {
    return payload;
  }
}
