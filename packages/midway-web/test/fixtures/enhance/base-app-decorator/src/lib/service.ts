import {config, plugin} from '../../../../../../src/decorators';
import {provide} from 'midway-context';

@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

}
