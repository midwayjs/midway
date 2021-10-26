import { BootStrategy } from '../../../../src/decorators';
// import { ExpressPassportStrategyAdapter } from '@deskbtm/midway-passport/src/express';
import { ExpressPassportStrategyAdapter } from '../../../../src';
import { Strategy } from 'passport-local';

@BootStrategy()
export class LocalStrategy extends ExpressPassportStrategyAdapter(
  Strategy,
  'local'
) {
  async verify(username, password) {
    return {
      username,
      password,
    };
  }
}

@BootStrategy({
  async useParams() {
    return {
      passwordField: 'pwd',
    };
  },
})
export class LocalStrategy2 extends ExpressPassportStrategyAdapter(
  Strategy,
  'local2'
) {
  async verify(username, password) {
    return {
      username,
      password,
    };
  }
}


