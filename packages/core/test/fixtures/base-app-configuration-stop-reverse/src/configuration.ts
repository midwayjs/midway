import { Configuration } from '../../../../src';

@Configuration({
  imports: [
    require('./a/configuration'),
    require('./b/configuration')
  ]
})
export class ContainerConfiguration {
}
