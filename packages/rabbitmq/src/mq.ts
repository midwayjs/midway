/**
 * This RabbitMQ Server changed from https://github.com/JeniTurtle/egg-rabbitmq-plus/blob/master/rabbitmq.ts
 */

import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import {
  IMidwayRabbitMQConfigurationOptions,
  IRabbitMQApplication,
  IRabbitMQExchange,
} from './interface';
import { RabbitMQListenerOptions } from '@midwayjs/decorator';
import { ConsumeMessage } from 'amqplib/properties';

export class RabbitMQServer
  extends EventEmitter
  implements IRabbitMQApplication
{
  private options: Partial<IMidwayRabbitMQConfigurationOptions>;
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private reconnectTime: number;
  private exchanges: IRabbitMQExchange[];
  private logger;
  private readyClose = false;

  constructor(options: Partial<IMidwayRabbitMQConfigurationOptions>) {
    super();
    this.options = options;
    this.reconnectTime = options.reconnectTime ?? 10000;
    this.exchanges = options.exchanges || [];
    this.logger = options.logger;
    this.on('reconnect', async () => {
      this.logger.info('Reconnect RabbitMQ Server');
      await this.connect();
    });
  }

  async connect() {
    try {
      this.connection = await amqp.connect(
        this.options.url,
        this.options.socketOptions
      );
    } catch (error) {
      this.logger.error('Connect fail and reconnect after timeout', error);
      await this.tryCloseConnection();
      setTimeout(() => {
        this.emit('reconnect');
      }, this.reconnectTime);
    }
  }

  async createChannel() {
    try {
      if (this.options.useConfirmChannel === false) {
        this.channel = await this.connection.createChannel();
      } else {
        this.channel = await this.connection.createConfirmChannel();
      }
      this.channel.on('close', () => this.onChannelClose(null));
      this.channel.on('error', error => this.onChannelError(error));
      this.channel.on('return', msg => this.onChannelReturn(msg));
      this.channel.on('drain', () => this.onChannelDrain());
      await this.assertAllExchange();
      this.emit('ch_open', this.channel);
    } catch (err) {
      this.emit('error', err);
      setTimeout(() => {
        this.createChannel();
      }, this.reconnectTime);
    }
  }

  async init() {
    await this.connect(); // 创建连接
    if (this.connection) {
      await this.createChannel(); // 创建channel
    }
  }

  async closeChannel() {
    if (!this.channel) {
      return;
    }
    try {
      await this.channel.close();
    } catch (err) {
      console.error(err);
    }
    this.channel = null;
  }

  async onChannelError(error) {
    this.emit('ch_error', error);
    // await this.closeChannel();
  }

  async onChannelClose(error) {
    this.emit('ch_close', error);
    // 执行应用关闭逻辑，就不做重连了
    if (!this.readyClose) {
      setTimeout(() => {
        this.createChannel();
      }, this.reconnectTime);
    }
  }

  onChannelReturn(msg) {
    this.emit('ch_return', msg);
  }

  onChannelDrain() {
    this.emit('ch_drain');
  }

  async assertAllExchange() {
    const exchangeList: any = [];
    for (const exchange of this.options.exchanges || []) {
      exchangeList.push(
        this.assertExchange(
          exchange.name,
          exchange.type,
          exchange.options
        ).then(exchangeIns => {
          this.exchanges[exchange.name] = exchangeIns;
        })
      );
    }
    return await Promise.all(exchangeList);
  }

  async createBinding(queue, exchange) {
    await this.assertQueue(queue.queueName, queue.options);
    if (!queue.keys) {
      await this.bindQueue(queue.queueName, exchange.exchange);
      return;
    }
    for (const index in queue.keys) {
      const key = queue.keys[index];
      await this.bindQueue(queue.queueName, exchange.exchange, key);
    }
  }

  assertExchange(exchange, type, options = {}) {
    if (!this.channel) {
      throw new Error('the channel is empty');
    }
    return this.channel.assertExchange(exchange, type, options);
  }

  async assertQueue(queue, options = {}) {
    if (!this.channel) {
      throw new Error('the channel is empty');
    }
    await this.channel.assertQueue(queue, options);
  }

  async bindQueue(queue, source, pattern?, args = {}) {
    if (!this.channel) {
      throw new Error('the channel is empty');
    }
    return this.channel.bindQueue(queue, source, pattern, args);
  }

  async createConsumer(
    listenerOptions: RabbitMQListenerOptions,
    listenerCallback: (msg: ConsumeMessage | null) => Promise<void>
  ) {
    // bind queue to exchange
    if (listenerOptions.exchange && this.exchanges[listenerOptions.exchange]) {
      await this.createBinding(
        listenerOptions,
        this.exchanges[listenerOptions.exchange]
      );
    }

    // 默认每次只接受一条
    await this.channel.prefetch(listenerOptions.prefetch || 1);
    // 绑定回调
    await this.channel.consume(
      listenerOptions.queueName,
      async msg => {
        if (
          !listenerOptions.routingKey ||
          msg.fields.routingKey === listenerOptions.routingKey
        ) {
          await listenerCallback(msg);
        }
      },
      listenerOptions.consumeOptions
    );
  }

  getChannel() {
    return this.channel;
  }

  async tryCloseConnection() {
    try {
      await this.closeChannel();
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

  async close() {
    this.logger.debug('RabbitMQ app will be close');
    this.readyClose = true;
    await this.tryCloseConnection();
  }
}
