const queues = {};
const exchanges = {};
const eventListeners = [];

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
    purge: () => (messages = [])
  };
};

const createFanoutExchange = () => {
  const bindings = [];
  return {
    bindQueue: (queueName, pattern, options) => {
      bindings.push({
        targetQueue: queueName,
        options,
        pattern
      });
    },
    getTargetQueues: (routingKey, options = {}) => {
      return [...bindings.map(binding => binding.targetQueue)];
    }
  };
};

const createDirectExchange = () => {
  const bindings = [];
  return {
    bindQueue: (queueName, pattern, options) => {
      bindings.push({
        targetQueue: queueName,
        options,
        pattern
      });
    },
    getTargetQueues: (routingKey, options = {}) => {
      const matchingBinding = bindings.find(binding => binding.pattern === routingKey);
      return [matchingBinding.targetQueue];
    }
  };
};

const createHeadersExchange = () => {
  const bindings = [];
  return {
    bindQueue: (queueName, pattern, options) => {
      bindings.push({
        targetQueue: queueName,
        options,
        pattern
      });
    },
    getTargetQueues: (routingKey, options: any = {}) => {
      const isMatching = (binding, headers) =>
        Object.keys(binding.options).every(key => binding.options[key] === headers[key]);
      const matchingBinding = bindings.find(binding => isMatching(binding, options.headers || {}));
      return [matchingBinding.targetQueue];
    }
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
    })
  },
  close: () => {},
  assertQueue: async queueName => {
    queues[queueName] = createQueue();
  },
  assertExchange: async (exchangeName, type) => {
    let exchange;

    switch(type) {
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
        routingKey
      },
      properties: options
    };

    for(const queueName of queueNames) {
      queues[queueName].add(message);
    }
  },
  sendToQueue: async (queueName, content, { headers }: any = {}) => {
    queues[queueName].add({
      content,
      fields: {
        exchange: '',
        routingKey: queueName
      },
      properties: { headers: headers || {} }
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
    messageCount: queues[queueName].getMessageCount()
  }),
  purgeQueue: queueName => queues[queueName].purge()
});

// @ts-ignore
const createConfirmChannel = async () => ({
  on: (eventName, listener) => {
    eventListeners.push({ eventName, listener });
  },
  emit: emittedEventName => {
    eventListeners.forEach(({ eventName, listener }) => {
      if (eventName === emittedEventName) {
        listener();
      }
    })
  },
  close: () => {},
  assertQueue: async queueName => {
    queues[queueName] = createQueue();
  },
  assertExchange: async (exchangeName, type) => {
    let exchange;

    switch(type) {
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
        routingKey
      },
      properties: options
    };

    for(const queueName of queueNames) {
      queues[queueName].add(message);
    }
  },
  sendToQueue: async (queueName, content, { headers }: any = {}) => {
    queues[queueName].add({
      content,
      fields: {
        exchange: '',
        routingKey: queueName
      },
      properties: { headers: headers || {} }
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
    messageCount: queues[queueName].getMessageCount()
  }),
  purgeQueue: queueName => queues[queueName].purge()
});

export const connect = async () => ({
  createChannel,
  createConfirmChannel,
  on: () => {
  },
  close: () => {
  }
});

