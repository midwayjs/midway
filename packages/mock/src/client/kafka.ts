import { KafkaConfig, Producer, ProducerConfig } from 'kafkajs';

const connect = async () => ({
  producer: () => {},
  cousumer: () => {},
});

export async function createKafkaProducer(options: {
  kafkaConfig: KafkaConfig;
  producerConfig?: ProducerConfig;
  mock?: boolean;
}): Promise<Producer>;
export async function createKafkaProducer(
  options: any = {
    mock: true,
  }
): Promise<Producer> {
  let { Kafka } = require('kafkajs');

  if (options.mock) {
    Kafka = connect;
  }
  const kafka = new Kafka(options.kafkaConfig);

  return kafka.producer(options.producerConfig);
}
