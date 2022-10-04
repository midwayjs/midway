import { Configuration } from '@midwayjs/core';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as faas from '@midwayjs/faas';

@Configuration({
  imports: [faas]
})
export class ContainerConfiguration {
  async onReady() {
    writeFileSync(join(__dirname, './ready.txt'), 'ready');
  }
  async onStop() {
    writeFileSync(join(__dirname, './stop.txt'), 'stop');
  }
}
