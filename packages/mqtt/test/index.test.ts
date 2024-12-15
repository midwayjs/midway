import { close, createLegacyApp, createLightApp } from '@midwayjs/mock';
import { IMidwayApplication, Provide, Scope, ScopeEnum, sleep } from '@midwayjs/core';
import { Framework, IMqttSubscriber, Mqtt, MqttProducerFactory } from '../src';
import { join } from 'path';

describe('/test/index.test.ts', () => {

  it('should test Mqtt export ', () => {
    expect(Mqtt).toBeDefined();
  });

  it('should test subscribe topic and send message', async () => {
    // create app and got data
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app'));
    await sleep();
    expect(app.getAttr('subscribe')).toBe(true);
    await close(app);
  });

  it('should test subscribe with no pub and sub', async () => {
    // create app and got data
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app-no-pub-sub'));
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
      host: '127.0.0.1',
      port: 1883,
    }, {
      topicObject: 'test_midway_dynamic',
    }, TestSubscriber, 'test');

    await sleep();

    // send
    const producerService = await app.getApplicationContext().getAsync(MqttProducerFactory);
    const producer = await producerService.createInstance({
      host: '127.0.0.1',
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
