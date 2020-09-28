// src/configuration.ts
import { Configuration, Config } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    './config/'
  ],
})
export class ContainerLifeCycle {

  @Config()
  mock;

  onReady() {
    console.log(this.mock);
  }
}