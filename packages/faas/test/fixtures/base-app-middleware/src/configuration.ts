import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: ['./config.default'],
})
export class AutoConfiguraion {
  async onReady(container) {
    container.registerObject('adb', { data: '123' });
  }
}
