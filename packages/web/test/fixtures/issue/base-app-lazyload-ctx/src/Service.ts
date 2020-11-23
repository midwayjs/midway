import { Inject, Provide } from '@midwayjs/decorator';
import { CodeService } from './app/service/CodeService';
import { UserService } from './app/service/UserService';

@Provide()
export class Service {
  @Inject()
  ctx: any;

  get code(): CodeService {
    return this.ctx.requestContext.get('codeService');
  }

  get user(): UserService {
    return this.ctx.requestContext.get('userService');
  }
}
