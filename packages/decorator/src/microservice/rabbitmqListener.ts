import { MS_CONSUMER_KEY, attachPropertyDataToClass } from '../';

export function RabbitMQListener(
  queueName: string,
  options: {
    propertyKey?: string;
    queueName?: string;
    exchange?: string;
    exclusive?: boolean;
    durable?: boolean;
    maxPriority?: number;
    prefetch?: number;
    keys?: { [keyName: string]: string };
    routingKey?: string;
    consumeOptions?: {
      consumerTag?: string;
      noLocal?: boolean;
      noAck?: boolean;
      exclusive?: boolean;
      priority?: number;
      arguments?: any;
    };
  } = {}
): MethodDecorator {
  return (target: any, propertyKey: string) => {
    options.queueName = queueName;
    options.propertyKey = propertyKey;
    attachPropertyDataToClass(MS_CONSUMER_KEY, options, target, propertyKey);
  };
}
