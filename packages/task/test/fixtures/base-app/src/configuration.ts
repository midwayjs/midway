import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import * as task from '../../../../src';

@Configuration({
  imports: [
    task
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
}
