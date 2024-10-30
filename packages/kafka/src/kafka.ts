import { Consumer, ConsumerConfig, Kafka, KafkaConfig } from 'kafkajs';
import { ILogger } from '@midwayjs/core';
import { EventEmitter } from 'stream';

export class KafkaConsumerServer extends EventEmitter {
  protected loggers: ILogger;
  protected logCreator: any;
  public connection: Consumer = null;

  constructor(options: any = {}) {
    super();
    this.logCreator = options.logCreator;
    this.loggers = options.logger;
    this.bindError();
  }

  bindError() {
    this.on('error', err => {
      this.loggers.error(err);
    });
  }

  async connect(options: KafkaConfig, consumerOptions: ConsumerConfig) {
    this.connection = new Kafka({
      logCreator: this.logCreator,
      ...options,
    }).consumer(consumerOptions);
    this.connection.on('consumer.connect', () => {
      this.loggers.info('Kafka consumer connected!');
    });
    this.connection.on('consumer.disconnect', err => {
      if (err) {
        this.loggers.error('Kafka consumer disconnected', err);
      } else {
        this.loggers.info('Kafka consumer disconnected!');
      }
    });
  }

  protected async closeConnection() {
    try {
      if (this.connection) {
        await this.connection.disconnect();
      }
      this.loggers.debug('Kafka consumer connection close success');
    } catch (err) {
      this.loggers.error('Kafka consumer connection close error', err);
    } finally {
      this.connection = null;
    }
  }

  async close() {
    this.loggers.debug('Kafka consumer will be close');
    await this.closeConnection();
  }
}
