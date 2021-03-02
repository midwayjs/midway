import { Configuration, FrameworkContainerScopeEnum } from '@midwayjs/decorator';

@Configuration({
  frameworkContainerScope: FrameworkContainerScopeEnum.FRAMEWORK,
})
export class AutoConfiguration {
  async onReady() {
    console.log('a');
  }
}

@Configuration({
})
export class AutoConfiguration1 {
  async onReady() {
    console.log('b');
  }
}
