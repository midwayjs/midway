import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class BaseService {

  @Inject()
  userManager;

  async getInformation() {
    return this.userManager.getUser();
  }
}
