import { config, plugin, provide } from '../../../../../../src';

@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

}
