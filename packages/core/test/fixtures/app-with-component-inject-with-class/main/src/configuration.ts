import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from "../../../../../src";
import * as bookComponent from '../../book';
import * as path from 'path';

@Configuration({
  imports: [
    bookComponent,
    path.resolve(path.join(__dirname, '../../bookstr'))
  ],
})
export class AutoConfiguration implements ILifeCycle {
  async onReady() {
  }
}
