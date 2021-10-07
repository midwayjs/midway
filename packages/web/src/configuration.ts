import { Configuration, Inject } from '@midwayjs/decorator';
import { MidwayWebSingleProcessFramework } from './framework/singleProcess';

@Configuration({
  namespace: 'egg',
})
export class EggConfiguration {
  @Inject()
  singleProcessFramework: MidwayWebSingleProcessFramework;

  @Inject()
  baseDir;

  @Inject()
  appDir;

  async onReady(container) {
    // // TODO 只在单进程执行
    // await this.singleProcessFramework.initialize({
    //   appDir: this.appDir,
    //   baseDir: this.baseDir,
    //   applicationContext: container,
    // });
  }

  async onServerReady() {
    // TODO 只在单进程执行
    await this.singleProcessFramework.run();
  }
}
