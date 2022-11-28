import { Bootstrap, BootstrapStarter } from './bootstrap';
import { ClusterBootstrapOptions } from '../interface';
import { ClusterFork } from '../fork/base';

export class ClusterBootstrapStarter extends BootstrapStarter {
  protected globalOptions: ClusterBootstrapOptions = {};
  private clusterFork: ClusterFork;
  async init() {
    return null;
  }

  public async run() {
    this.clusterFork = new ClusterFork({
      exec: '',
      ...this.globalOptions,
    });

    await this.clusterFork.start();
  }

  public async stop() {
    await this.clusterFork.close();
  }
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
