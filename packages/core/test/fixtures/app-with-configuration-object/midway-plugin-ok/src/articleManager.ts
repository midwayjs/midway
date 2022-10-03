import { Provide, Inject } from '../../../../../src';

@Provide()
export class ArticleManager {
  @Inject()
  replaceManager;

  async getOne() {
    return this.replaceManager.getOne();
  }
}
