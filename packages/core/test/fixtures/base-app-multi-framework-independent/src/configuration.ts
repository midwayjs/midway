import { Configuration, FrameworkContainerScopeEnum, App } from '@midwayjs/decorator';

@Configuration({
  frameworkContainerScope: FrameworkContainerScopeEnum.FRAMEWORK,
})
export class AutoConfiguration {

  @App()
  app;

  async onReady() {
    console.log('a');
  }
}

@Configuration({
})
export class AutoConfiguration1 {

  @App()
  app;

  async onReady() {
    console.log('b');
  }
}
