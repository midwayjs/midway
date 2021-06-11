import { Configuration } from '@midwayjs/decorator';
import * as orm from '../../../../src';

@Configuration({
  imports: [
    orm
  ],
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {
}
