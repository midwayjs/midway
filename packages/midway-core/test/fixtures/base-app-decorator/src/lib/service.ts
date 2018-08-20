import {config, plugin} from '../../../../../src/decorators';
import {provide, async} from 'injection';
@async()
@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

}
