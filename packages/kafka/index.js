const { Kafka } = require('kafkajs');

// 连接
const kafka = new Kafka({
  clientId: 'my-app',
  //  brokers: ['192.168.2.36:9093'],
  // brokers: ['120.24.63.212:9094'],
  brokers: ['127.0.0.1:9092'],
});

const producer = kafka.producer();

async function createTopic() {
  await producer.connect();
  const sendRes = await producer.send({
    topic: 'test-topic',
    messages: [{ value: 'Hello KafkaJS user!' }],
  });
  console.info(sendRes);
  await producer.disconnect();
}

createTopic();

// 生成生产者
// const producer = kafka.producer()

// await producer.connect()
// await producer.send({
//   topic: 'test-topic'
// });

// 构建消费者

console.log(kafka);
