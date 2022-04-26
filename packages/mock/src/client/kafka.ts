import { KafkaConfig, Producer } from 'kafkajs';

const connect = async () => ({
  producer: () => {
    // connect: () => {},
    // disconnect: () =>{}
  },
  cousumer: () => {},
});

export async function createKafkaProducer(
  options: KafkaConfig
): Promise<Producer>;
export async function createKafkaProducer(
  options: any = {
    mock: true,
  }
): Promise<Producer> {
  let { Kafka } = require('kafkajs');

  if (options.mock) {
    Kafka = connect;
  }
  const kafka = new Kafka(options);

  return kafka.producer();
}
