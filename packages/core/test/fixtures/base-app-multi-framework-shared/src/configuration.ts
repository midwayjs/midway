import { App, Configuration, FrameworkContainerScopeEnum, MidwayFrameworkType } from '@midwayjs/decorator';

let idx = {num: 0};
let idx2 = {num: 0};

@Configuration({
  frameworkContainerScope: FrameworkContainerScopeEnum.GLOBAL,
})
export class AutoConfiguration {
  @App()
  app;

  async onReady() {
    console.log('a');
    idx.num++;
    this.app.getApplicationContext().registerObject('total', idx);
  }
}

@Configuration({
  frameworkContainerScope: FrameworkContainerScopeEnum.FRAMEWORK, // 这里即使加上作用域也是没有用的，只有第一个作用域设置的会被生效
  framework: MidwayFrameworkType.MS_GRPC,
})
export class AutoConfiguration1 {
  @App()
  app;

  async onReady() {
    console.log('b');
    idx2.num++;
    this.app.getApplicationContext().registerObject('total2', idx2);
  }
}

