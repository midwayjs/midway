import { Provide } from '@midwayjs/decorator';

@Provide()
export class ReplaceManager {
  async getOne() {
    return 'one article';
  }
}
