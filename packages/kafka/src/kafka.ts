import { Consumer, ConsumerConfig, Kafka, KafkaConfig } from 'kafkajs';
import { ILogger } from '@midwayjs/logger';
import { IKafkaApplication } from './interface';
import { EventEmitter } from 'stream';

export class KafkaConsumerServer
  extends EventEmitter
  implements IKafkaApplication
{
  protected loggers: ILogger;
  public connection: Consumer = null;

  constructor(options: any = {}) {
    super();
    this.loggers = options.logger;
    this.bindError();
  }

  bindError() {
    this.on('error', err => {
      this.loggers.error(err);
    });
  }

  async connect(options: KafkaConfig, consumerOptions: ConsumerConfig) {
    try {
      this.connection = new Kafka(options).consumer(consumerOptions);
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
    } catch (error) {
      this.loggers.error('Kafka consumer connect fail', error);
      await this.closeConnection();
    }
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
