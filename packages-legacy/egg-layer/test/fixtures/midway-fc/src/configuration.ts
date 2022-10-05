import { Configuration } from '@midwayjs/core';
import { join } from 'path';
import * as Web from '../../../../../../packages/web';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
  imports: [
    Web
  ]
})
export class ContainerConfiguration {
}
