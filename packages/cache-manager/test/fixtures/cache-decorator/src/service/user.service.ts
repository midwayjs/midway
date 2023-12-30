import { Provide } from '@midwayjs/core';
import { Caching } from '../../../../../src';

@Provide()
export class UserService {

  @Caching('default', 'abc', 10)
  async getUser(name: string){
    return name;
  }

  @Caching('default', 'error', 10)
  async getUserThrowError(name: string){
    if (name === 'harry') {
      return name;
    } else {
      throw new Error('error');
    }
  }
}
