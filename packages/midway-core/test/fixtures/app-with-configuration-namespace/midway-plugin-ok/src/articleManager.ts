import { Provide } from '@midwayjs/decorator';

@Provide()
export class ArticleManager {
  async getOne() {
    return 'two article';
  }
}
