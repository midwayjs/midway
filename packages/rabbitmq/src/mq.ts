/**
 * This RabbitMQ Server changed from https://github.com/JeniTurtle/egg-rabbitmq-plus/blob/master/rabbitmq.ts
 */

import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import { IMidwayRabbitMQConfigurationOptions, IRabbitMQApplication } from './interface';
import { RabbitMQListenerOptions } from '@midwayjs/decorator';
import { ConsumeMessage, Replies } from 'amqplib/properties';

export class RabbitMQServer extends EventEmitter implements IRabbitMQApplication {

  private options: Partial<IMidwayRabbitMQConfigurationOptions>;
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private reconnectTimeInSeconds: number;
  private exchanges: { [exchangeName: string]: Replies.AssertExchange };
  // private consumerCallback = {};

  constructor(options: Partial<IMidwayRabbitMQConfigurationOptions>) {
    super();
    this.options = options;
    // this.queues = options.queues;
    this.reconnectTimeInSeconds = options.reconnectTimeInSeconds;
  }

  async connect() {
    this.connection = await amqp.connect(this.options.url, this.options.socketOptions);
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
      // this.createAllConsumer();
      this.emit('ch_open', this.channel);
    } catch (err) {
      this.emit('error', err);
      setTimeout(() => {
        this.createChannel();
      }, this.reconnectTimeInSeconds);
    }
  }

  async init() {
    await this.connect(); // 创建连接
    await this.createChannel(); // 创建channel
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
    await this.closeChannel();
    setTimeout(() => {
      this.createChannel();
    }, this.reconnectTimeInSeconds);
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
    await this.assertQueue(queue.name, queue.options);
    if (!queue.keys) {
      await this.bindQueue(queue.name, exchange.name);
      return;
    }
    for (const index in queue.keys) {
      const key = queue.keys[index];
      await this.bindQueue(queue.name, exchange.name, key);
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
      await this.createBinding(listenerOptions, this.exchanges[listenerOptions.exchange]);
    }

    // 默认每次只接受一条
    await this.channel.prefetch(listenerOptions.prefetch || 1);
    // 绑定回调
    await this.channel.consume(listenerOptions.queueName, async msg => {
      if (!listenerOptions.routingKey || msg.fields.routingKey === listenerOptions.routingKey) {
        await listenerCallback(msg);
      }
    }, listenerOptions.consumeOptions);
  }

  getChannel() {
    return this.channel;
  }

  async close() {
    try {
      this.connection && (await this.connection.close());
    } catch (err) {
      console.error(err);
    }
    this.connection = null;
  }
}
