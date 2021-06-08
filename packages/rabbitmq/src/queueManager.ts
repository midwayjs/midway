import { EventEmitter } from 'events';

interface IQueueConnection {
  close();
}

export abstract class QueueManager<
  Connection extends IQueueConnection
> extends EventEmitter {
  protected readyClose = false;
  protected connection: Connection = null;
  protected reconnectTime;
  protected logger;

  constructor(options: any = {}) {
    super();
    this.logger = options.logger;
    this.reconnectTime = options.reconnectTime ?? 10 * 1000;
    this.bindError();
  }

  async connect(...args) {
    try {
      this.connection = await this.createConnection(...args);
      (this.connection as any).on('connect', () => {
        this.logger.info('Message Queue connected!');
      });
      (this.connection as any).on('disconnect', err => {
        if (err) {
          if (err.err) {
            err = err.err;
          }
          this.logger.error('Message Queue disconnected', err);
        } else {
          this.logger.info('Message Queue disconnected!');
        }
      });
    } catch (error) {
      this.logger.error('Message Queue connect fail', error);
      await this.closeConnection();
    }
  }

  bindError() {
    this.on('error', err => {
      this.logger.error(err);
    });
  }

  abstract createConnection(...args): Promise<Connection>;

  protected async closeConnection() {
    try {
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.debug('Message Queue connection close success');
    } catch (err) {
      this.logger.error('Message Queue connection close error', err);
    } finally {
      this.connection = null;
    }
  }

  async close() {
    this.logger.debug('Message Queue will be close');
    await this.closeConnection();
  }
}
