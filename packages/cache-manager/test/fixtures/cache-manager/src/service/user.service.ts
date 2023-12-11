import { InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '../../../../../src';

@Provide()
export class UserService {

  @InjectClient(CachingFactory, 'default')
  cache: MidwayCache

  async setUser(name: string, value: string){
    await this.cache.set(name, value);
  }

  async getUser(name: string){
    return await this.cache.get(name);
  }

  async reset(){
    await this.cache.reset();
  }
}
