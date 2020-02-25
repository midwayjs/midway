import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class UserManager {
  @Inject('@midwayjs/midway-plugin-atmod:articleManager')
  articleManager: any;

  async getUser() {
    return 'harry' + (await this.articleManager.getOne()) ;
  }
}
