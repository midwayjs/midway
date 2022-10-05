import { Provide } from '@midwayjs/core';

@Provide()
export class ReplaceManager {
  async getOne() {
    return 'replace manager';
  }
}
