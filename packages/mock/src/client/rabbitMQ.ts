import { Channel } from 'amqplib';
import { debuglog } from 'util';

const queues = {};
const exchanges = {};
const eventListeners = [];
const EventEmitter = require('events').EventEmitter;
const debug = debuglog('midway:mock');

const createQueue = () => {
  let messages = [];
  let subscriber = null;

  return {
    add: item => {
      if (subscriber) {
        subscriber(item);
      } else {
        messages.push(item);
      }
    },
    get: () => messages.shift() || false,
    addConsumer: consumer => {
      messages.forEach(item => consumer(item));
      messages = [];
      subscriber = consumer;
    },
    stopConsume: () => (subscriber = null),
    getMessageCount: () => messages.length,
    purge: () => (messages = []),
  };
};

const createConfirmQueue = () => {
  let messages = [];
  let subscriber = null;

  return {
    add: item => {
      if (subscriber) {
        subscriber(item);
      } else {
        messages.push(item);
      }
    },
    get: () => messages.shift() || false,
    addConsumer: async (consumer, waitForConfirms) => {
      for (const item of messages) {
        await waitForConfirms(() => {
          consumer(item);
        });
      }
      messages = [];
      subscriber = consumer;
    },
    stopConsume: () => (subscriber = null),
    getMessageCount: () => messages.length,
    purge: () => (messages = []),
  };
};

const createFanoutExchange = () => {
  const bindings = [];
  return {
    bindQueue: (queueName, pattern, options) => {
      bindings.push({
        targetQueue: queueName,
        options,
        pattern,
      });
    },
    getTargetQueues: (routingKey, options = {}) => {
      return [...bindings.map(binding => binding.targetQueue)];
    },
  };
};

const createDirectExchange = () => {
  const bindings = [];
  return {
    bindQueue: (queueName, pattern, options) => {
      bindings.push({
        targetQueue: queueName,
        options,
        pattern,
      });
    },
    getTargetQueues: (routingKey, options = {}) => {
      const matchingBinding = bindings.find(
        binding => binding.pattern === routingKey
      );
      return [matchingBinding.targetQueue];
    },
  };
};

const createHeadersExchange = () => {
  const bindings = [];
  return {
    bindQueue: (queueName, pattern, options) => {
      bindings.push({
        targetQueue: queueName,
        options,
        pattern,
      });
    },
    getTargetQueues: (routingKey, options: any = {}) => {
      const isMatching = (binding, headers) =>
        Object.keys(binding.options).every(
          key => binding.options[key] === headers[key]
        );
      const matchingBinding = bindings.find(binding =>
        isMatching(binding, options.headers || {})
      );
      return [matchingBinding.targetQueue];
    },
  };
};

const createChannel = async () => ({
  on: (eventName, listener) => {
    eventListeners.push({ eventName, listener });
  },
  emit: emittedEventName => {
    eventListeners.forEach(({ eventName, listener }) => {
      if (eventName === emittedEventName) {
        listener();
      }
    });
  },
  close: () => {},
  assertQueue: async queueName => {
    queues[queueName] = createQueue();
  },
  assertExchange: async (exchangeName, type) => {
    let exchange;

    switch (type) {
      case 'fanout':
        exchange = createFanoutExchange();
        break;
      case 'direct':
        exchange = createDirectExchange();
        break;
      case 'headers':
        exchange = createHeadersExchange();
        break;
    }

    exchanges[exchangeName] = exchange;
  },
  bindQueue: async (queue, sourceExchange, pattern, options = {}) => {
    const exchange = exchanges[sourceExchange];
    exchange.bindQueue(queue, pattern, options);
  },
  publish: async (exchangeName, routingKey, content, options = {}) => {
    const exchange = exchanges[exchangeName];
    const queueNames = exchange.getTargetQueues(routingKey, options);
    const message = {
      content,
      fields: {
        exchange: exchangeName,
        routingKey,
      },
      properties: options,
    };

    for (const queueName of queueNames) {
      queues[queueName].add(message);
    }
  },
  sendToQueue: async (queueName, content, { headers }: any = {}) => {
    queues[queueName].add({
      content,
      fields: {
        exchange: '',
        routingKey: queueName,
      },
      properties: { headers: headers || {} },
    });
  },
  get: async (queueName, { noAck }: any = {}) => {
    return queues[queueName].get();
  },
  prefetch: async () => {},
  consume: async (queueName, consumer) => {
    queues[queueName].addConsumer(consumer);
    return { consumerTag: queueName };
  },
  cancel: async consumerTag => queues[consumerTag].stopConsume(),
  ack: async () => {},
  nack: async (message, allUpTo = false, requeue = true) => {
    if (requeue) {
      queues[message.fields.routingKey].add(message);
    }
  },
  checkQueue: queueName => ({
    queue: queueName,
    messageCount: queues[queueName].getMessageCount(),
  }),
  purgeQueue: queueName => queues[queueName].purge(),
});

const createConfirmChannel = async () => {
  const evt = new EventEmitter();
  return {
    on: (eventName, listener) => {
      eventListeners.push({ eventName, listener });
    },
    emit: emittedEventName => {
      eventListeners.forEach(({ eventName, listener }) => {
        if (eventName === emittedEventName) {
          listener();
        }
      });
    },
    close: () => {},
    assertQueue: async queueName => {
      queues[queueName] = createConfirmQueue();
    },
    assertExchange: async (exchangeName, type) => {
      let exchange;

      switch (type) {
        case 'fanout':
          exchange = createFanoutExchange();
          break;
        case 'direct':
          exchange = createDirectExchange();
          break;
        case 'headers':
          exchange = createHeadersExchange();
          break;
      }

      exchanges[exchangeName] = exchange;
    },
    bindQueue: async (queue, sourceExchange, pattern, options = {}) => {
      const exchange = exchanges[sourceExchange];
      exchange.bindQueue(queue, pattern, options);
    },
    publish: async (exchangeName, routingKey, content, options = {}) => {
      const exchange = exchanges[exchangeName];
      const queueNames = exchange.getTargetQueues(routingKey, options);
      const message = {
        content,
        fields: {
          exchange: exchangeName,
          routingKey,
        },
        properties: options,
      };

      for (const queueName of queueNames) {
        queues[queueName].add(message);
      }
    },
    sendToQueue: async (queueName, content, { headers }: any = {}) => {
      queues[queueName].add({
        content,
        fields: {
          exchange: '',
          routingKey: queueName,
        },
        properties: { headers: headers || {} },
      });
    },
    get: async (queueName, { noAck }: any = {}) => {
      return queues[queueName].get();
    },
    prefetch: async () => {},
    consume: async (queueName, consumer) => {
      await queues[queueName].addConsumer(consumer, async invokeListenerFn => {
        return new Promise<void>(resolve => {
          evt.on('ack', () => {
            resolve();
          });
          invokeListenerFn();
        });
      });
      return { consumerTag: queueName };
    },
    cancel: async consumerTag => queues[consumerTag].stopConsume(),
    ack: async () => {
      evt.emit('ack');
    },
    nack: async (message, allUpTo = false, requeue = true) => {
      if (requeue) {
        queues[message.fields.routingKey].add(message);
      }
    },
    checkQueue: queueName => ({
      queue: queueName,
      messageCount: queues[queueName].getMessageCount(),
    }),
    purgeQueue: queueName => queues[queueName].purge(),
  };
};

const connect = async () => ({
  createChannel,
  createConfirmChannel,
  on: () => {},
  close: () => {},
});


export const createRabbitMQProducer = async function (
  queueName: string,
  options: {
    url?: string;
    isConfirmChannel?: boolean;
    mock?: boolean;
  } = {
    mock: true
  }
): Promise<Channel> {

  let amqp = null;

  if(options.mock){
    try {
      amqp = require('amqplib');
      amqp.connect = connect;
    } catch (err) {
      debug('can not found amqplib lib and skip');
    }
  }
  const connection = await amqp.connect(options.url || 'amqp://localhost');
  let ch;
  if (
    options.isConfirmChannel === undefined ||
    options.isConfirmChannel === false
  ) {
    ch = await connection.createConfirmChannel();
  } else {
    ch = await connection.createChannel();
  }

  await ch.assertQueue(queueName);
  return ch;
};
