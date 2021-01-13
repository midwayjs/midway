import { Config, Init, Provide, Scope, ScopeEnum } from "@midwayjs/decorator";
import * as amqp from 'amqplib'
@Scope(ScopeEnum.Singleton)
@Provide()
export class RabbitmqProducer{

  @Config('rabbitmq')
  options;

  client: amqp.Connection;

  channel: amqp.Channel;

  async getMQConnection(options) {
    let connection = await amqp.connect(options)
    this.channel = await connection.createChannel();
    return connection;
  }

  getConnection(){
    return this.client;
  }

  getChannel(): amqp.Channel{
    return this.channel;
  }

  @Init()
  async connect() {
    this.client = await this.getMQConnection(this.options)
  }
}
