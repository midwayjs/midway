import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class UserManager {
  @Inject('@midwayjs/midway-plugin-atmod:articleManager')
  articleManager: any;

  @Inject('@midwayjs/midway-plugin-btmod:articleManager')
  articleManager1: any;

  async getUser() {
    return 'harry' + (await this.articleManager.getOne()) ;
  }

  async getTest() {
    return 'test' + (await this.articleManager1.getOne());
  }
}
