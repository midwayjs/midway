import { Inject, Provide } from '@midwayjs/decorator';

@Provide()
export class Home {
  @Inject()
  baseDir: string;

  async getData() {
    return this.baseDir;
  }
}
