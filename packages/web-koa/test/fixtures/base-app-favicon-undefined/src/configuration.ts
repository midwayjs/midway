import { Configuration, App } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  imports: [
    require('../../../../src'),
  ],
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class ContainerConfiguration {

  @App()
  app;

  async onReady() {
  }
}
