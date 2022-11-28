import { Bootstrap, BootstrapStarter } from './bootstrap';
import { ClusterBootstrapOptions } from '../interface';

export class ClusterBootstrapStarter extends BootstrapStarter {

}

export class ClusterBootstrap extends Bootstrap {
  /**
   * set global configuration for midway
   * @param configuration
   */
  static configure(configuration: ClusterBootstrapOptions = {}) {
    return super.configure(configuration);
  }

  static getStarter() {
    if (!this.starter) {
      this.starter = new ClusterBootstrapStarter();
    }
    return this.starter;
  }
}
