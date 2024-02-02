import { extend } from '../util/extend';
import { IServiceFactory } from '../interface';
import { MidwayPriorityManager } from './priorityManager';
import { Inject } from '../decorator';
import { MidwayCommonError } from '../error';

/**
 * 多客户端工厂实现
 */
export abstract class ServiceFactory<T> implements IServiceFactory<T> {
  protected clients: Map<string, T> = new Map();
  protected clientPriority: Record<string, string>;

  protected options = {};

  @Inject()
  protected priorityManager: MidwayPriorityManager;

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

    // set priority
    this.clientPriority = options.priority || {};
  }

  public get<U = T>(id = 'default'): U {
    return this.clients.get(id) as unknown as U;
  }

  public has(id: string): boolean {
    return this.clients.has(id);
  }

  public add(
    id: string,
    client: T,
    options = {
      errorWhenExists: true,
    }
  ): void {
    if (options.errorWhenExists && this.clients.has(id)) {
      throw new MidwayCommonError(`client ${id} already exists`);
    }
    this.clients.set(id, client);
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
