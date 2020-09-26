/**
 * This RabbitMQ Server changed from https://github.com/JeniTurtle/egg-rabbitmq-plus/blob/master/rabbitmq.ts
 */

import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import { IMidwayRabbitMQConfigurationOptions, IRabbitMQApplication } from './interface';
import { RabbitMQListenerOptions } from '@midwayjs/decorator';
import { Replies } from 'amqplib/properties';

interface SubscribeParams {
  queue: string;
  routingKey: string;
  callback: (any?) => void;
}

export class RabbitMQServer extends EventEmitter implements IRabbitMQApplication {

  private options: Partial<IMidwayRabbitMQConfigurationOptions>;
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private reconnectTimeInSeconds: number;
  private exchanges: { [exchangeName: string]: Replies.AssertExchange };
  private queues;
  private consumer;
  private subscribeCallbackOptions: SubscribeParams[] = [];

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
      this.channel = await this.connection.createConfirmChannel();
      this.channel.on('close', () => this.onChannelClose(null));
      this.channel.on('error', error => this.onChannelError(error));
      this.channel.on('return', msg => this.onChannelReturn(msg));
      this.channel.on('drain', () => this.onChannelDrain());
      await this.assertAllExchange();
      // await this.createAllBinding();
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

  async createAllBinding() {
    const exchangeConfig = {};
    Object.getOwnPropertyNames(this.exchanges).forEach(async index => {
      const exchange = this.exchanges[index];
      exchangeConfig[exchange.name] = exchange;
    });
    return await Promise.all(
      Object.getOwnPropertyNames(this.queues).map(async index => {
        const queue = this.queues[index];
        const exchange = exchangeConfig[queue.exchange];
        if (exchange) {
          return this.createBinding(queue, exchange);
        }
      }),
    );
  }

  createAllConsumer() {
    const consumer = this.consumer.bind(this);
    const callbackOptions = this.subscribeCallbackOptions;
    Object.getOwnPropertyNames(this.queues).forEach(async index => {
      const queue = this.queues[index];
      if (!queue.autoSubscribe) {
        return;
      }
      await consumer(
        queue.name,
        async data => {
          const promiseArray: any[] = [];
          callbackOptions.forEach(async option => {
            // 如果不设置routingKey，则不作判断
            if (option.queue === queue.name && (!option.routingKey || data.fields.routingKey === option.routingKey)) {
              promiseArray.push(option.callback(data));
            }
          });
          await Promise.all(promiseArray);
        },
        queue.subscribeOptions,
      );
    });
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
    return this.channel.assertQueue(queue, options);
  }

  async bindQueue(queue, source, pattern?, args = {}) {
    if (!this.channel) {
      throw new Error('the channel is empty');
    }
    return this.channel.bindQueue(queue, source, pattern, args);
  }

  async createConsumer(
    listenerOptions: RabbitMQListenerOptions,
    listenerCallback
  ) {
    // assert queue
    await this.assertQueue(listenerOptions.queueName);
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
