import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class BaseService {

  @Inject()
  userManager;

  @Inject()
  articleManager;

  async getInformation() {
    const result1 = await this.userManager.getUser();
    const result2 = await this.articleManager.getOne();
    return result1 + ',' + result2;
  }
}
