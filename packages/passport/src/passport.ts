import { authenticate, authorize, initialize } from './patch/framework';
import { Passport } from 'passport';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayPassportService extends Passport {

  constructor(isExpressMode: boolean) {
    super();
    if (!isExpressMode) {
      this.framework({
        initialize,
        authenticate,
        authorize,
      });
    }
  }
}
