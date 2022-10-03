import { Configuration } from '../../../../src';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ]
})
export class ContainerConfiguration {
}
