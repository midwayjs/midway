import { EventEmitter } from 'events';

jest.mock('mqtt', () => {
  return {
    connect: jest.fn(() => {
      const client = new EventEmitter() as any;
      client.subscribeAsync = jest.fn(async () => undefined);
      client.endAsync = jest.fn(async () => undefined);
      process.nextTick(() => client.emit('connect'));
      return client;
    }),
  };
});

const { MidwayMQTTFramework } = require('../src/framework');

describe('/test/entry-trace.test.ts', () => {
  it('should create entry span for mqtt message', async () => {
    const framework = new MidwayMQTTFramework();
    (framework as any).logger = {
      info() {},
      error() {},
    };
    const runWithEntrySpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (framework as any).applicationContext = {
      get() {
        return {
          runWithEntrySpan,
        };
      },
    };
    (framework as any).applyMiddleware = async fn => fn;
    (framework as any).app = {
      createAnonymousContext() {
        return {
          requestContext: {
            async getAsync() {
              return {
                async subscribe() {
                  return true;
                },
              };
            },
          },
        };
      },
    };

    class FakeSubscriber {
      async subscribe() {
        return true;
      }
    }

    const client = (await framework.createSubscriber(
      {} as any,
      {
        topicObject: 'test',
      } as any,
      FakeSubscriber,
      'default'
    )) as EventEmitter;

    client.emit('message', 'test', Buffer.from('hello'), {
      properties: {
        userProperties: {},
      },
    });
    await new Promise(resolve => setImmediate(resolve));
    expect(runWithEntrySpan).toHaveBeenCalled();
  });
});
