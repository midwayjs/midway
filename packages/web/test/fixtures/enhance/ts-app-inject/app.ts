import { inject, provide } from 'injection';
import { Loader } from './loader';

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
