import * as assert from 'assert';

/**
 * 多客户端工厂实现
 */
export abstract class ServiceFactory<T> {
  private clients: Map<string, T> = new Map();
  private options;

  async initClients(options) {
    this.options = options;
    assert(
      !(options.client && options.clients),
      `midway:${this.getName()} can not set options.client and options.clients both`
    );

    // alias app[name] as client, but still support createInstance method
    if (options.client) {
      await this.createInstance(options.client, 'default');
      return;
    }

    // multi client, use app[name].getInstance(id)
    if (options.clients) {
      for (const id of Object.keys(options.clients)) {
        await this.createInstance(options.clients[id], id);
      }
      return;
    }
  }

  get(id = 'default') {
    return this.clients.get(id);
  }

  async createInstance(config, clientName) {
    // options.default will be merge in to options.clients[id]
    config = Object.assign({}, this.options.default, config);
    const client = this.createClient(config);
    this.clients.set(clientName, client);
    return client;
  }

  abstract getName();
  protected abstract createClient(config);
}
