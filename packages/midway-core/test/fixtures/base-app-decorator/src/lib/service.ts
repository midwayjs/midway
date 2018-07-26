import {config, plugin} from '../../../../../src/decorators';
import {provide} from 'injection';

@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

}
