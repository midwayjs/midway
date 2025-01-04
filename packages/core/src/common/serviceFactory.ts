import { extend } from '../util/extend';
import { IServiceFactory } from '../interface';
import { MidwayPriorityManager } from './priorityManager';
import { Inject } from '../decorator';
import { Types } from '../util/types';

/**
 * 多客户端工厂实现
 */
export abstract class ServiceFactory<T> implements IServiceFactory<T> {
  protected clients: Map<string, T> = new Map();
  protected clientPriority: Record<string, string>;

  protected options = {};

  @Inject()
  protected priorityManager: MidwayPriorityManager;

  // for multi client with initialization
  private creatingClients = new Map<string, Promise<any>>();

  protected async initClients(
    options: any = {},
    initOptions: {
      concurrent?: boolean;
    } = {}
  ): Promise<void> {
    this.options = options;

    // merge options.client to options.clients['default']
    if (options.client) {
      options.clients = options.clients || {};
      options.clients['default'] = options.clients['default'] || {};
      extend(true, options.clients['default'], options.client);
    }

    if (options.clients) {
      const entries = Object.entries(options.clients);
      if (initOptions.concurrent) {
        // multi client with concurrent initialization
        await Promise.all(
          entries.map(([id, config]) => this.createInstance(config, id))
        );
      } else {
        // multi client with serial initialization
        for (const [id, config] of entries) {
          await this.createInstance(config, id);
        }
      }
    }

    // set priority
    this.clientPriority = options.priority || {};
  }

  public get<U = T>(id = 'default'): U {
    return this.clients.get(id) as unknown as U;
  }

  public has(id: string): boolean {
    return this.clients.has(id);
  }

  public async createInstance(config: any, clientName?: string): Promise<any> {
    if (clientName) {
      if (this.has(clientName)) {
        return this.get(clientName);
      }

      if (this.creatingClients.has(clientName)) {
        return this.creatingClients.get(clientName);
      }
    }

    // options.default will be merge in to options.clients[id]
    config = extend(true, {}, this.options['default'], config);

    const clientCreatingPromise = this.createClient(config, clientName);

    if (clientCreatingPromise && Types.isPromise(clientCreatingPromise)) {
      if (clientName) {
        this.creatingClients.set(
          clientName,
          clientCreatingPromise as Promise<T>
        );
      }
      return (clientCreatingPromise as Promise<T>)
        .then(client => {
          if (clientName) {
            this.clients.set(clientName, client as T);
          }
          return client;
        })
        .finally(() => {
          if (clientName) {
            this.creatingClients.delete(clientName);
          }
        });
    }

    // 处理同步返回的情况
    if (clientName) {
      this.clients.set(clientName, clientCreatingPromise as T);
    }
    return clientCreatingPromise;
  }

  public abstract getName(): string;
  protected abstract createClient(
    config,
    clientName
  ): Promise<T | void> | (T | void);
  protected async destroyClient(
    client: T,
    clientName?: string
  ): Promise<void> {}

  public async stop(): Promise<void> {
    for (const [name, value] of this.clients.entries()) {
      await this.destroyClient(value, name);
    }
    this.clients.clear();
  }

  public getDefaultClientName(): string {
    return this.options['defaultClientName'];
  }

  public getClients() {
    return this.clients;
  }

  public getClientKeys() {
    return Array.from(this.clients.keys());
  }

  public getClientPriority(name: string) {
    return this.priorityManager.getPriority(this.clientPriority[name]);
  }

  public isHighPriority(name: string) {
    return this.priorityManager.isHighPriority(this.clientPriority[name]);
  }

  public isMediumPriority(name: string) {
    return this.priorityManager.isMediumPriority(this.clientPriority[name]);
  }

  public isLowPriority(name: string) {
    return this.priorityManager.isLowPriority(this.clientPriority[name]);
  }
}
