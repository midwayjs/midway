import { extend } from '../util/extend';
import { IServiceFactory } from '../interface';

/**
 * 多客户端工厂实现
 */
export abstract class ServiceFactory<T> implements IServiceFactory<T> {
  protected clients: Map<string, T> = new Map();
  protected options = {};

  protected async initClients(options: any = {}): Promise<void> {
    this.options = options;

    // merge options.client to options.clients['default']
    if (options.client) {
      options.clients = options.clients || {};
      options.clients['default'] = options.clients['default'] || {};
      extend(true, options.clients['default'], options.client);
    }

    // multi client
    if (options.clients) {
      for (const id of Object.keys(options.clients)) {
        await this.createInstance(options.clients[id], id);
      }
    }
  }

  public get<U = T>(id = 'default'): U {
    return this.clients.get(id) as unknown as U;
  }

  public has(id: string): boolean {
    return this.clients.has(id);
  }

  public async createInstance(config, clientName?): Promise<T | undefined> {
    // options.default will be merge in to options.clients[id]
    config = extend(true, {}, this.options['default'], config);
    const client = await this.createClient(config, clientName);
    if (client) {
      if (clientName) {
        this.clients.set(clientName, client);
      }
      return client;
    }
  }

  public abstract getName(): string;
  protected abstract createClient(
    config,
    clientName
  ): Promise<T | void> | (T | void);
  protected async destroyClient(client: T): Promise<void> {}

  public async stop(): Promise<void> {
    for (const value of this.clients.values()) {
      await this.destroyClient(value);
    }
  }

  public getDefaultClientName(): string {
    return this.options['defaultClientName'];
  }
}
