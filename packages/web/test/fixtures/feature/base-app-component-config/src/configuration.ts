import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    require('./component/sql/src')
  ],
})
export class ContainerConfiguration {}
