import { Inject, Provide } from '@midwayjs/decorator';

@Provide()
export class Home {
  @Inject()
  baseDir: string;

  @Inject()
  aaa;      // 当前组件注册的属性

  @Inject()
  ccc;      // 全局注入的属性

  async getData() {
    return this.baseDir + '/' + this.aaa + '/' + this.ccc;
  }
}
