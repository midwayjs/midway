/**
 * This RabbitMQ Server changed from https://github.com/JeniTurtle/egg-rabbitmq-plus/blob/master/rabbitmq.ts
 */

import * as amqp from 'amqp-connection-manager';
import { QueueManager } from './queueManager';
import { IRabbitMQApplication } from './interface';
import { ConsumeMessage } from 'amqplib/properties';
import { RabbitMQListenerOptions } from '@midwayjs/decorator';
import { Channel } from 'amqplib';

export class RabbitMQServer
  extends QueueManager<amqp.Connection>
  implements IRabbitMQApplication
{
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
              listenerOptions.pattern,
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
              if (
                !listenerOptions.routingKey ||
                msg.fields.routingKey === listenerOptions.routingKey
              ) {
                await listenerCallback(msg, channel, channelWrapper);
              }
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
}
