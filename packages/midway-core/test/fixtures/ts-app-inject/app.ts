import {Loader} from './loader';
import {provide} from 'injection';
import {inject} from 'injection';

@provide()
export class App {

  @inject('easyLoader')
  loader: Loader;

  @inject('loader')
  easyLoader: Loader;

  getConfig() {
    return this.loader.getConfig();
  }
}
