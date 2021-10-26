import { BootStrategy } from '../../../../src/decorators';
import { WebPassportStrategyAdapter } from '../../../../src';
import { Strategy } from 'passport-local';

@BootStrategy()
export class LocalStrategy extends WebPassportStrategyAdapter(
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
export class LocalStrategy2 extends WebPassportStrategyAdapter(
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
