import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class ArticleManagera {
  @Inject()
  replaceManagera;

  async getOne() {
    return this.replaceManagera.getOne();
  }
}
