import { Provide, Inject, Config } from '@midwayjs/decorator';

@Provide()
export class BaseService {

  @Inject()
  userManager;

  @Inject('empty:articleManager')
  articleManager1;

  @Inject('articleManagera')
  articleManager2;

  @Inject('@midway-plugin-mock')
  articleManager;

  @Inject('@ok:articleManager')
  newArticleManager;

  @Config('helloworld')
  helloworld: any;

  async getInformation() {
    const result1 = await this.userManager.getUser();
    const result2 = await this.articleManager.getOne();
    const result3 = await this.newArticleManager.getOne();
    return result1 + ',' + result2 + ',' + result3;
  }
}
