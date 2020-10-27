// src/configuration.ts
import { Configuration, Config, App } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/')
  ],
})
export class ContainerLifeCycle {

  @Config()
  mock;

  @App()
  app;

  onReady() {
    console.log(this.app);
    console.log(this.mock);
  }
}
