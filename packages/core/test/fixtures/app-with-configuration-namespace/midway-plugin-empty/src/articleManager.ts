import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class ArticleManager {
  @Inject()
  replaceManager;

  async getOne() {
    return this.replaceManager.getOne();
  }
}
