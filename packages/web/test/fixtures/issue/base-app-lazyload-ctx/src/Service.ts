import { inject, provide } from '../../../../../src';
import { CodeService } from './app/service/CodeService';
import { UserService } from './app/service/UserService';

@provide()
export class Service {
  @inject()
  ctx: any;

  get code(): CodeService {
    return this.ctx.requestContext.get('codeService');
  }

  get user(): UserService {
    return this.ctx.requestContext.get('userService');
  }
}
