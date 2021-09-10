import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from "../../../../../src";
import * as bookComponent from '../../book';
import * as circularComponent from '../../circular';
import * as path from 'path';
@Configuration({
  imports: [
    bookComponent,
    path.resolve(path.join(__dirname, '../../bookstr')),
    circularComponent
  ],
})
export class AutoConfiguration implements ILifeCycle {
  async onReady() {
  }
}
