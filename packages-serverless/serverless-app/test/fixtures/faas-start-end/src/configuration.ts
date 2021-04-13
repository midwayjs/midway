import { Configuration } from '@midwayjs/decorator';
import { writeFileSync } from 'fs';
import { join } from 'path';

@Configuration()
export class ContainerConfiguration {
  async onReady() {
    writeFileSync(join(__dirname, './ready.txt'), 'ready');
  }
  async onStop() {
    writeFileSync(join(__dirname, './stop.txt'), 'stop');
  }
}
