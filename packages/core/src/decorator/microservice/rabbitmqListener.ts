import { MS_CONSUMER_KEY, attachPropertyDataToClass } from '../../';

export interface RabbitMQListenerOptions {
  propertyKey?: string;
  queueName?: string;
  exchange?: string;
  /**
   * queue options
   */
  exclusive?: boolean;
  durable?: boolean;
  autoDelete?: boolean;
  messageTtl?: number;
  expires?: number;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  maxLength?: number;
  maxPriority?: number;
  pattern?: string;
  /**
   * prefetch
   */
  prefetch?: number;
  /**
   * router
   */
  routingKey?: string;
  /**
   * exchange options
   */
  exchangeOptions?: {
    type?: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string;
    durable?: boolean;
    internal?: boolean;
    autoDelete?: boolean;
    alternateExchange?: string;
    arguments?: any;
  };
  /**
   * consumeOptions
   */
  consumeOptions?: {
    consumerTag?: string;
    noLocal?: boolean;
    noAck?: boolean;
    exclusive?: boolean;
    priority?: number;
    arguments?: any;
  };
}

export function RabbitMQListener(
  queueName: string,
  options: RabbitMQListenerOptions = {}
): MethodDecorator {
  return (target: any, propertyKey: string) => {
    options.queueName = queueName;
    options.propertyKey = propertyKey;
    attachPropertyDataToClass(MS_CONSUMER_KEY, options, target, propertyKey);
  };
}
