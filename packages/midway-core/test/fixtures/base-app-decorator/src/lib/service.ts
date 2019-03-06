import {config, plugin, logger} from '@midwayjs/decorator';
import {provide, async} from 'injection';
@async()
@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

  @logger()
  logger;
}
