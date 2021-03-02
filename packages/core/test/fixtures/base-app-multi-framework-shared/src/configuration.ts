import { Configuration, FrameworkContainerScopeEnum } from '@midwayjs/decorator';

@Configuration({
  frameworkContainerScope: FrameworkContainerScopeEnum.GLOBAL,
})
export class AutoConfiguration {
  async onReady() {
  }
}
