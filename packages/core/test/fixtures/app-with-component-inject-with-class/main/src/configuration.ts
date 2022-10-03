import { Configuration } from '../../../../../src';
import { ILifeCycle } from "../../../../../src";
import * as bookComponent from '../../book';
import * as circularComponent from '../../circular';
@Configuration({
  imports: [
    bookComponent,
    require('../../bookstr'),
    circularComponent
  ],
})
export class AutoConfiguration implements ILifeCycle {
  async onReady() {
  }
}
