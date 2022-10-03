import { Provide } from '../../../../../src';

@Provide()
export class ReplaceManager {
  async getOne() {
    return 'one article';
  }
}
