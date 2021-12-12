import { Configuration, App } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
  imports: [
    require('../../../../src')
  ],
})
export class ContainerConfiguration {

  @App()
  app;

  async onReady() {
  }
}
