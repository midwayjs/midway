import { Inject, Provide } from 'injection';
import { Loader } from './loader';

@Provide()
export class App {

  @Inject('easyLoader')
  loader: Loader;

  @Inject('loader')
  easyLoader: Loader;

  getConfig() {
    return this.loader.getConfig();
  }
}
