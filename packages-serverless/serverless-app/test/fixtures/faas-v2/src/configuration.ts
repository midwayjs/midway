import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    './config/'
  ],
  imports: [
    '@midwayjs/faas-middleware-upload'
  ]
})
export class ContainerConfiguration {
}
