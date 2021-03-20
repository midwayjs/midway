import { Inject, Provide } from '@midwayjs/decorator';
import { CacheManager } from '../../../../../src/index';

@Provide()
export class UserService {

  @Inject(`cache:cacheManager`)
  cache: CacheManager;

  async setUser(name: string, value: string){
    await this.cache.set(name, value);
  }

  async getUser(name: string){
    let result = await this.cache.get(name);
    return result;
  }

  async reset(){
    await this.cache.reset();
  }
}
