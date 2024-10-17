import { close, createApp, createLightApp } from '@midwayjs/mock';
import { IMidwayApplication, Provide, Scope, ScopeEnum, sleep } from '@midwayjs/core';
import { Framework, IMqttSubscriber, Mqtt, MqttProducerFactory } from '../src';

describe('/test/index.test.ts', () => {

  it('should test Mqtt export ', () => {
    expect(Mqtt).toBeDefined();
  });

  it('should test subscribe topic and send message', async () => {
    // create app and got data
    const app = await createApp('base-app');
    await sleep();
    expect(app.getAttr('subscribe')).toBe(true);
    await close(app);
  });

  it('should test subscribe with no pub and sub', async () => {
    // create app and got data
    const app = await createApp('base-app-no-pub-sub');
    await sleep();
    await close(app);
  });

  it('should test dynamic create mqtt subscribe case', async () => {
    let app: IMidwayApplication;
    @Provide()
    @Scope(ScopeEnum.Request)
    class TestSubscriber implements IMqttSubscriber {
      async subscribe() {
        app.setAttr('subscribe', true);
      }
    }
    app = await createLightApp({
      imports: [
        require('../src')
      ],
      preloadModules: [
        TestSubscriber
      ]
    });
    await (app.getFramework() as Framework).createSubscriber({
      host: 'test.mosquitto.org',
      port: 1883,
    }, {
      topicObject: 'test_midway_dynamic',
    }, TestSubscriber, 'test');

    await sleep();

    // send
    const producerService = await app.getApplicationContext().getAsync(MqttProducerFactory);
    const producer = await producerService.createInstance({
      host: 'test.mosquitto.org',
      port: 1883,
    }, 'test');

    producer.publish('test_midway_dynamic', 'hello world', {
      qos: 2
    });

    await sleep();

    expect(app.getAttr('subscribe')).toBe(true);

    await close(app);
  });
});
