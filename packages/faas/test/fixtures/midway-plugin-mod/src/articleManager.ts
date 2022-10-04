import { Provide, Inject } from '@midwayjs/core';
import { ReplaceManager } from './replaceManager';

@Provide()
export class ArticleManager {
  @Inject()
  replaceManager: ReplaceManager;

  async getOne() {
    return 'one article' + (await this.replaceManager.getOne());
  }
}
