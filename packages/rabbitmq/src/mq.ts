/**
 * This RabbitMQ Server changed from https://github.com/JeniTurtle/egg-rabbitmq-plus/blob/master/rabbitmq.ts
 */

import * as amqp from 'amqp-connection-manager';
import { QueueManager } from './queueManager';
import { IRabbitMQApplication } from './interface';
import { ConsumeMessage } from 'amqplib/properties';
import { RabbitMQListenerOptions } from '@midwayjs/decorator';
import { Channel } from 'amqplib';

export class RabbitMQServer extends QueueManager<amqp.Connection> implements IRabbitMQApplication {
  protected channelManagerSet: Set<Channel> = new Set();

  createChannel(isConfirmChannel = false): Promise<any> {
    if (!isConfirmChannel) {
      return this.connection.createChannel();
    } else {
      return this.connection.createConfirmChannel();
    }
  }

  async createConnection(url, socketOptions): Promise<any> {
    return amqp.connect(url, socketOptions);
  }

  async createConsumer(listenerOptions: RabbitMQListenerOptions, listenerCallback: (msg: ConsumeMessage | null, channel: Channel, channelWrapper) => Promise<void>) {
    const channelWrapper = this.connection.createChannel({
      setup: (channel: Channel) => {
        // `channel` here is a regular amqplib `ConfirmChannel`.
        return Promise.all([
          channel.assertQueue(listenerOptions.queueName, listenerOptions),
          channel.assertExchange(listenerOptions.exchange, listenerOptions.exchangeOptions.type ?? 'topic', listenerOptions.exchangeOptions),
          channel.prefetch(listenerOptions.prefetch ?? 1),
          channel.bindQueue(listenerOptions.queueName, listenerOptions.exchange, listenerOptions.pattern, listenerOptions.exchangeOptions),
          channel.consume(listenerOptions.queueName, async msg => {
            if (
              !listenerOptions.routingKey ||
              msg.fields.routingKey === listenerOptions.routingKey
            ) {
              await listenerCallback(msg, channel, channelWrapper);
            }
          }, listenerOptions.consumeOptions),
        ]);
      },
      json: true,
    });
    return channelWrapper.waitForConnect();
  }
}
