import { Config, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import * as amqp from 'amqplib';
@Scope(ScopeEnum.Singleton)
@Provide()
export class RabbitmqProducer {
  @Config('rabbitmq')
  options;

  client: amqp.Connection;

  channel: amqp.Channel;

  async getMQConnection(
    options: string | amqp.Options.Connect
  ): Promise<amqp.Connection> {
    const connection = await amqp.connect(options);
    this.channel = await connection.createChannel();
    return connection;
  }

  getConnection(): amqp.Connection {
    return this.client;
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }

  @Init()
  async connect(): Promise<void> {
    this.client = await this.getMQConnection(this.options);
  }
}
