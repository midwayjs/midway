import { Provide } from '../../../../../src';

@Provide()
export class ArticleManager {
  async getOne() {
    return 'one article';
  }
}
