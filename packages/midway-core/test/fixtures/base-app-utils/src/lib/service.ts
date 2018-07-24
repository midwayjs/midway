import {config, plugin} from '../../../../../src/decorators';
import {provide} from 'midway-context';
import {get, logger} from '../../../../../src';
import {inject} from '../../../../../../context/dist';

@provide()
export class BaseService {

  @config('hello')
  config;

  @plugin('plugin2')
  plugin2;

  @inject('is')
  isModule;

  @logger()
  logger;

  async getData() {
    return this.isModule.function('hello').toString() + this.config.c;
  }
}
