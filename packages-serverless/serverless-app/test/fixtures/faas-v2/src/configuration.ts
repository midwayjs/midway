import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config/')
  ],
  imports: [
    require('@midwayjs/faas-middleware-upload')
  ]
})
export class ContainerConfiguration {
}
