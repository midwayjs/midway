import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class BaseService {

  @Inject()
  userManager;

  @Inject('midway-plugin-mock:articleManager')
  articleManager;

  @Inject('ok:articleManager')
  newArticleManager;

  async getInformation() {
    const result1 = await this.userManager.getUser();
    const result2 = await this.articleManager.getOne();
    const result3 = await this.newArticleManager.getOne();
    return result1 + ',' + result2 + ',' + result3;
  }
}
