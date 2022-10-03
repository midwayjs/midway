import { Loader } from './loader';
import { Inject, Provide } from '../../../src';

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
