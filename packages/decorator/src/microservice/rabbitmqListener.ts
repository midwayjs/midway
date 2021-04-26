import { MS_CONSUMER_KEY, attachPropertyDataToClass, RabbitMQListenerOptions } from '../';

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
