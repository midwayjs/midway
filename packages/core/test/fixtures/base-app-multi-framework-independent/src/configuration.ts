import { App, Configuration, FrameworkContainerScopeEnum, MidwayFrameworkType } from '@midwayjs/decorator';
import * as assert from 'assert';

@Configuration({
  frameworkContainerScope: FrameworkContainerScopeEnum.FRAMEWORK,
  framework: MidwayFrameworkType.CUSTOM,
})
export class AutoConfiguration {

  @App()
  app;

  async onReady() {
    console.log('a');
    assert(this.app.getFrameworkType() === MidwayFrameworkType.CUSTOM);
  }
}

@Configuration({
  framework: MidwayFrameworkType.MS_GRPC,
})
export class AutoConfiguration1 {

  @App()
  app;

  async onReady() {
    console.log('b');
    assert(this.app.getFrameworkType() === MidwayFrameworkType.MS_GRPC);
  }
}
