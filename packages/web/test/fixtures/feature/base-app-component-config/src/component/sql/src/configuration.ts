// src/configuration.ts
import { Configuration, Config, App } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/')
  ],
})
export class ContainerLifeCycle {

  @Config()
  mock;

  @MainApp()
  app;

  onReady() {
    console.log(this.app);
    console.log(this.mock);
  }
}
