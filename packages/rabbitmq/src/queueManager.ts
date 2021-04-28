import { EventEmitter } from 'events';

interface IQueueConnection {
  close();
}

interface IQueueChannel {
  close();
}


export abstract class QueueManager<Connection extends IQueueConnection, Channel extends IQueueChannel> extends EventEmitter {

  protected readyClose = false;
  private refHandlerList = new Set();
  protected connection: Connection = null;
  protected channelManagerSet: Set<Channel> = new Set();
  protected reconnectTime;
  protected logger;

  constructor(options: any = {}) {
    super();
    this.logger = options.logger;
    this.reconnectTime = options.reconnectTime ?? 10 * 1000;
    this.bindError();
  }

  async init() {
    await this.connect(); // 创建连接
    if (this.connection) {
      await this.createChannel(); // 创建channel
    }
  }

  async connect() {
    try {
      this.connection = await this.createConnection();
    } catch (error) {
      this.logger.error('Connect fail and reconnect after timeout', error);
      await this.tryCloseConnection();
      const handler = setTimeout(() => {
        this.refHandlerList.delete(handler);
        this.emit('reconnect');
      }, this.reconnectTime);
      this.refHandlerList.add(handler);
    }
  }

  bindError() {
    this.on('error', err => {
      this.logger.error(err);
    });
  }

  abstract createChannel(...args): Promise<Channel>;
  abstract createConnection(...args): Promise<Connection>;

  protected async closeAllChannel() {
    try {
      if (this.channelManagerSet.size) {
        for (const item of this.channelManagerSet) {
          await this.item.close();
        }
      }
      this.logger.debug('RabbitMQ channel close success');
    } catch (err) {
      this.logger.error('RabbitMQ channel close error', err);
    } finally {
      this.channelManagerSet.clear();
    }
  }

  protected async tryCloseConnection() {
    try {
      await this.closeAllChannel();
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.debug('RabbitMQ connection close success');
    } catch (err) {
      this.logger.error('RabbitMQ connection close error', err);
    } finally {
      this.connection = null;
    }
  }

  async addChannel() {
    const channel = await this.createChannel();
    this.channelManagerSet.add(channel);
  }

  async close() {
    await this.connection.close();
    this.refHandlerList.clear();
    this.readyClose = true;
    this.logger.debug('RabbitMQ app will be close');
    this.refHandlerList.forEach((handler: any) => {
      clearTimeout(handler);
    });
    await this.tryCloseConnection();
  }

}
