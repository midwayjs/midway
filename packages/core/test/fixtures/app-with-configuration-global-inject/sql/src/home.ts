import { Inject, Provide } from '@midwayjs/decorator';

@Provide()
export class Home {
  @Inject()
  baseDir: string;

  @Inject()
  aaa;

  async getData() {
    return this.baseDir + '/' + this.aaa;
  }
}
