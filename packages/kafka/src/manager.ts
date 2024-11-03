import { Kafka } from 'kafkajs';

export class KafkaManager {
  private kafkaInstanceMap: Map<string, Kafka> = new Map();
  private static instance: KafkaManager;

  private constructor() {}

  getKafkaInstance(name: string) {
    return this.kafkaInstanceMap.get(name);
  }

  addKafkaInstance(name: string, kafka: Kafka) {
    this.kafkaInstanceMap.set(name, kafka);
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new KafkaManager();
    }
    return this.instance;
  }
}
