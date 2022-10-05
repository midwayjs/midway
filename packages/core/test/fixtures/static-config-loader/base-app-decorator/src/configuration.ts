import { Configuration } from '../../../../../src';
import { join } from 'path';

@Configuration({
  imports: [
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class AutoConfiguration {

}
