import { Provide } from '@midwayjs/core';
import { Caching } from '../../../../../src';

@Provide()
export class UserService {

  @Caching('default')
  async getDefaultUser(name: string){
    return 'hello ' + name;
  }

  @Caching('default', 100)
  async getDefaultUserWithTTL(name: string){
    return 'hello ttl ' + name;
  }

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
