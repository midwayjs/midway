import { EventEmitter } from 'events';
import * as amqp from 'amqp-connection-manager';
import { IMidwayRabbitMQConfigurationOptions, IRabbitMQApplication } from './interface';
import { AmqpConnectionManager } from 'amqp-connection-manager';

export class RabbitMQServer extends EventEmitter implements IRabbitMQApplication {

  private options: Partial<IMidwayRabbitMQConfigurationOptions>;
  private connectionManager: AmqpConnectionManager;
  private channelWrapper;

  constructor(options: Partial<IMidwayRabbitMQConfigurationOptions>) {
    super();
    this.options = options;
  }

  async connect() {
    this.connectionManager = amqp.connect([].concat(this.options.url), this.options.amqpConnectionManagerOptions);
  }

  async createChannel() {
    // Ask the connection manager for a ChannelWrapper.  Specify a setup function to
// run every time we reconnect to the broker.
    this.channelWrapper = this.connectionManager.createChannel({
      json: true,
      setup: function (channel) {
        return channel.consume("test", (data) => {
          // TODO create context and bind requestContext
          console.log('----got data', data);
        });
      }
    });
  }

  async init() {
    await this.connect(); // 创建连接
    await this.createChannel(); // 创建channel
  }

  async close() {
    await this.closeAllChannel();
    await this.connectionManager.close();
  }

  async closeAllChannel(): Promise<void> {
    return this.channelWrapper.close();
  }
}
