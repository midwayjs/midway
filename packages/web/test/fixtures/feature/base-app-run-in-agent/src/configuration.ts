import { Configuration, Init, Inject } from '@midwayjs/core';
import { join } from 'path';
import { AgentApp, RunInEggAgent } from '../../../../../src/decorator';
import { writeFileSync } from 'fs';


@RunInEggAgent()
export class Test {

  @AgentApp()
  agent;

  @Inject()
  appDir;

  @Init()
  async init() {
    if (this.agent) {
      writeFileSync(join(this.appDir, '.result'), 'success');
    } else {
      writeFileSync(join(this.appDir, '.result'), 'fail');
    }
  }
}

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
}
