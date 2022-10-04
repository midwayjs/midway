import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  imports: [join(__dirname, './fixtures/midway-plugin-mod')],
})
export class ContainerLifeCycle {}
