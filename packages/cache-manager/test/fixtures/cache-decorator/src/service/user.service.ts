import { Provide } from '@midwayjs/core';
import { Caching } from '../../../../../src';

function cacheBy({methodArgs, ctx, target}) {
  if (methodArgs[0] === 'harry' || methodArgs[0] === 'mike') {
    return 'cache1';
  } else {
    return 'cache2';
  }
}

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

  @Caching('default', cacheBy, 10)
  async getCustomUser(name: string){
    return 'hello ' + name;
  }
}
