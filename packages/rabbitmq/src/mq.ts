/**
 * This RabbitMQ Server changed from https://github.com/JeniTurtle/egg-rabbitmq-plus/blob/master/rabbitmq.ts
 */

import * as amqp from 'amqp-connection-manager';
import { IRabbitMQApplication } from './interface';
import { ConsumeMessage } from 'amqplib/properties';
import { RabbitMQListenerOptions } from '@midwayjs/decorator';
import type { Channel } from 'amqplib';
import { ILogger } from '@midwayjs/logger';
import { EventEmitter } from 'events';

export class RabbitMQServer
  extends EventEmitter
  implements IRabbitMQApplication
{
  protected channelManagerSet: Set<Channel> = new Set();
  protected connection: amqp.AmqpConnectionManager = null;
  protected logger: ILogger;
  protected reconnectTime;

  constructor(options: any = {}) {
    super();
    this.logger = options.logger;
    this.reconnectTime = options.reconnectTime ?? 10 * 1000;
    this.bindError();
  }

  bindError() {
    this.on('error', err => {
      this.logger.error(err);
    });
  }

  createChannel(isConfirmChannel = false): Promise<any> {
    if (!isConfirmChannel) {
      return this.connection.connection.createChannel();
    } else {
      return this.connection.connection.createConfirmChannel();
    }
  }

  async connect(url, socketOptions) {
    try {
      this.connection = await amqp.connect(url, socketOptions);
      this.connection.on('connect', () => {
        this.logger.info('Message Queue connected!');
      });
      this.connection.on('disconnect', err => {
        if (err) {
          if (err.err) {
            err = err.err as any;
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

  async createConsumer(
    listenerOptions: RabbitMQListenerOptions,
    listenerCallback: (
      msg: ConsumeMessage | null,
      channel: Channel,
      channelWrapper
    ) => Promise<void>
  ) {
    const channelWrapper = this.connection.createChannel({
      setup: (channel: Channel) => {
        // `channel` here is a regular amqplib `ConfirmChannel`.
        const channelHandlers = [];

        // create queue
        channelHandlers.push(
          channel.assertQueue(
            listenerOptions.queueName,
            Object.assign({ durable: true }, listenerOptions)
          )
        );

        if (listenerOptions.exchange) {
          // create exchange
          channelHandlers.push(
            channel.assertExchange(
              listenerOptions.exchange,
              listenerOptions.exchangeOptions?.type ?? 'topic',
              listenerOptions.exchangeOptions
            )
          );
          // bind exchange and queue
          channelHandlers.push(
            channel.bindQueue(
              listenerOptions.queueName,
              listenerOptions.exchange,
              listenerOptions.routingKey || listenerOptions.pattern,
              listenerOptions.exchangeOptions
            )
          );
        }

        channelHandlers.push(channel.prefetch(listenerOptions.prefetch ?? 1));

        // listen queue
        channelHandlers.push(
          channel.consume(
            listenerOptions.queueName,
            async msg => {
              await listenerCallback(msg, channel, channelWrapper);
            },
            listenerOptions.consumeOptions
          )
        );

        return Promise.all(channelHandlers);
      },
      json: true,
    });
    return channelWrapper.waitForConnect();
  }

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
