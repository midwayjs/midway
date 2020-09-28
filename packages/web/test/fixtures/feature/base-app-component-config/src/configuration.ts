import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: ['./component/sql/src'],
})
export class ContainerConfiguration {}
