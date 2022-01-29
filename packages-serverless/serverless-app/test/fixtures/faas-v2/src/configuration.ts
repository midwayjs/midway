import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import * as faas from '@midwayjs/faas';

@Configuration({
  importConfigs: [
    join(__dirname, './config/')
  ],
  imports: [
    faas,
    require('@midwayjs/faas-middleware-upload')
  ]
})
export class ContainerConfiguration {
}
