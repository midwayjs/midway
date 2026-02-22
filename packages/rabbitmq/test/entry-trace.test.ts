jest.mock('@midwayjs/core', () => {
  const actual = jest.requireActual('@midwayjs/core');
  return {
    ...actual,
    listPropertyDataFromClass: jest.fn(() => [
      [
        {
          queueName: 'queue-a',
          propertyKey: 'subscribe',
        },
      ],
    ]),
  };
});

const core = require('@midwayjs/core');
const { MidwayRabbitMQFramework } = require('../src/framework');

describe('/test/entry-trace.test.ts', () => {
  it('should create entry span for rabbitmq consume flow', async () => {
    class RabbitSubscriber {
      async subscribe() {
        return true;
      }
    }

    jest
      .spyOn(core.DecoratorManager, 'listModule')
      .mockReturnValue([RabbitSubscriber]);
    jest.spyOn(core.MetadataManager, 'getOwnMetadata').mockReturnValue({
      type: core.MSListenerType.RABBITMQ,
    });

    const runWithEntrySpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });

    const framework = new MidwayRabbitMQFramework();
    (framework as any).logger = {
      error() {},
      warn() {},
      info() {},
      debug() {},
    };
    (framework as any).configurationOptions = {
      url: 'amqp://localhost',
    };
    (framework as any).applicationContext = {
      get() {
        return {
          runWithEntrySpan,
        };
      },
    };
    (framework as any).applyMiddleware = async fn => fn;
    (framework as any).app = {
      async connect() {},
      async close() {},
      getFramework() {
        return {
          async runGuard() {
            return true;
          },
        };
      },
      createAnonymousContext(ctx) {
        ctx.requestContext = {
          async getAsync() {
            return new RabbitSubscriber();
          },
        };
      },
      async createConsumer(_listenerOptions, callback) {
        await callback(
          {
            properties: {
              headers: {},
            },
          },
          {},
          {
            ack() {},
          }
        );
      },
    };

    await framework.run();

    expect(runWithEntrySpan).toHaveBeenCalled();
  });
});
