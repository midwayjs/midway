import {Loader} from './loader';
import {provide} from 'midway-context';
import {inject} from 'midway-context';

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
