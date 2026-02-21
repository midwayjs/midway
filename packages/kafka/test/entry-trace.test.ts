jest.mock('kafkajs', () => {
  class FakeConsumer {
    async connect() {}
    async subscribe() {}
    async disconnect() {}
    async run(config) {
      if (config?.eachMessage) {
        await config.eachMessage({
          topic: 'topic-a',
          message: {
            headers: {},
          },
        });
      }
    }
  }

  class Kafka {
    constructor(_options?: any) {}
    consumer(_options?: any) {
      return new FakeConsumer();
    }
  }

  return {
    Kafka,
    logLevel: {
      NOTHING: 0,
      ERROR: 1,
      WARN: 2,
      INFO: 3,
      DEBUG: 4,
    },
  };
});

const { DecoratorManager, MetadataManager } = require('@midwayjs/core');
const { MidwayKafkaFramework } = require('../src/framework');

describe('/test/entry-trace.test.ts', () => {
  it('should create entry span for kafka message', async () => {
    class KafkaSubscriber {
      async eachMessage() {
        return true;
      }
    }

    jest
      .spyOn(DecoratorManager, 'listModule')
      .mockReturnValue([KafkaSubscriber]);
    jest
      .spyOn(MetadataManager, 'getOwnMetadata')
      .mockReturnValue('sub1');

    const runWithEntrySpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });

    const framework = new MidwayKafkaFramework();
    (framework as any).logger = {
      error() {},
      warn() {},
      info() {},
      debug() {},
    };
    (framework as any).configurationOptions = {
      consumer: {
        sub1: {
          connectionOptions: {},
          consumerOptions: {
            groupId: 'test-group',
          },
          subscribeOptions: {
            topics: ['topic-a'],
          },
        },
      },
    };
    (framework as any).applicationContext = {
      get() {
        return {
          runWithEntrySpan,
        };
      },
    };
    (framework as any).app = {
      getFramework() {
        return {
          async runGuard() {
            return true;
          },
        };
      },
      createAnonymousContext() {
        return {
          requestContext: {
            async getAsync() {
              return new KafkaSubscriber();
            },
          },
        };
      },
    };
    (framework as any).applyMiddleware = async fn => fn;

    await framework.run();

    expect(runWithEntrySpan).toHaveBeenCalled();
  });
});
