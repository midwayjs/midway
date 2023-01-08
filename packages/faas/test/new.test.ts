import * as assert from 'assert';
import * as mm from 'mm';
import { createNewStarter, closeApp } from './utils';
import { createFunctionApp, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '../src';
import { join } from 'path';
import { BootstrapStarter } from '../../../packages-serverless/midway-fc-starter/src';

describe('test/new.test.ts', () => {

  it('should test dynamic function', async () => {
    const starter = await createNewStarter('base-app-dynamic-function');

    let result = await createHttpRequest(starter)
      .get('/api/user')
      .query({
        name: 'zhangting',
      });
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world,zhangting');

    result = await createHttpRequest(starter)
      .get('/api/user/zhangting');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world,zhangting');

    result = await createHttpRequest(starter)
      .post('/api/user').send({
        userId: 'zhangting',
      })
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world,zhangting');

    result = await starter.invokeTriggerFunction({
      originEvent: {
        text: 'zhangting',
      },
      originContext: {}
    }, 'event.handler', {
      isHttpFunction: false,
    });
    expect(result).toEqual('zhangtinghello world');

    await closeApp(starter);
  });

  it('invoke handler by default name', async () => {
    const starter = await createNewStarter('base-app');
    const data = await starter.invokeTriggerFunction(
      {
        text: 'hello',
        originContext: {},
        originEvent: { text: 'a' },
      },
      'helloService.handler',
      {
        isHttpFunction: false,
      }
    );
    expect(data).toEqual('ahello');
  });

  it('invoke different handler use @Handler', async () => {
    const starter = await createNewStarter('base-app-handler');
    assert(
      (await starter.invokeTriggerFunction(
        {
          text: 'hello',
          originContext: {},
          originEvent:  { text: 'a' }
        },
        'indexService.handler',
        {
          isHttpFunction: false,
        }
      )) === 'ahello'
    );
    assert(
      (await starter.invokeTriggerFunction(
        {
          text: 'hello',
          originContext: {},
          originEvent:  { text: 'a' }
        },
        'indexService.getList',
        {
          isHttpFunction: false,
        }
      )) === 'ahello'
    );
    await closeApp(starter);
  });

  it('use default handler and new handler', async () => {
    const starter = await createNewStarter('base-app-handler2');
    assert(
      (await starter.invokeTriggerFunction(
        {
          text: 'hello',
          originContext: {},
          originEvent:  { text: 'a' }
        },
        'indexService.handler',
        {
          isHttpFunction: false,
        }
      )) === 'defaultahello'
    );
    assert(
      (await starter.invokeTriggerFunction(
        {
          text: 'hello',
          originContext: {},
          originEvent:  { text: 'ab' }
        },
        'indexService.getList',
        {
          isHttpFunction: false,
        }
      )) === 'abhello'
    );
    assert(
      (await starter.invokeTriggerFunction({},'indexService.get', {
        isHttpFunction: false,
      })) ===
        'hello'
    );
    await closeApp(starter);
  });

  it('invoke handler by another name', async () => {
    const starter = await createNewStarter('base-app-route');
    const data = await starter.invokeTriggerFunction(
      {
        text: 'hello',
        originContext: {},
        originEvent:  { text: 'ab' }
      },
      'helloService.handler',
      {
        isHttpFunction: false,
      }
    );
    assert(data === 'abhello');
    await closeApp(starter);
  });

  // it('use simple lock start should exec only once', async () => {
  //   const starter = await creatApp('base-app');
  //
  //   let i = 0;
  //   const cb = async () => {
  //     i++;
  //   };
  //   const arr = [starter.start({ cb }), starter.start({ cb }), starter.start({ cb })];
  //   await Promise.all(arr);
  //   assert(1 === i);
  //   await closeApp(starter);
  // });

  it('use new decorator and use function middleware', async () => {
    const starter = await createNewStarter('base-app-new');
    const data = await starter.invokeTriggerFunction(
      {
        text: 'hello',
        originContext: {},
        originEvent:  { text: 'ab' }
      },
      'helloService.handler',
      {
        isHttpFunction: false,
      }
    );
    expect(data).toEqual('abhelloextra data');
    await closeApp(starter);
  });

  it.skip('test inject logger', async () => {
    const { start } = require('@midwayjs/serverless-scf-starter');
    const runtime = await start();
    const starter = await createNewStarter('base-app-inject-logger', {
      applicationAdapter: runtime,
    });

    const data = await starter.invokeTriggerFunction(
      {
        text: 'hello',
        httpMethod: 'GET',
        headers: {},
        originEvent:  { text: 'a' }
      },
      'helloService.handler',
      {
        isHttpFunction: false,
      });

    assert(data.body === 'hello world');
    await closeApp(starter);
  });

  it('invoke controller handler', async () => {
    const starter = await createNewStarter('base-app-controller');
    let data = await starter.invokeTriggerFunction(
      {
        text: 'hello',
        originContext: {},
        originEvent:  { text: 'a' }
      },
      'helloService.handler',
      {
        isHttpFunction: false,
      }
    );
    expect(data).toEqual('ahello');

    const result = await createHttpRequest(starter).get('/api').query({
      name: 'zhangting',
      age: 3
    });

    expect(result.text).toEqual('hello world,zhangting3');
  });

  it('should test new test method', async () => {
    mm(process.env, 'MIDWAY_SERVERLESS_FUNCTION_NAME',  'aaa');
    mm(process.env, 'MIDWAY_SERVERLESS_SERVICE_NAME',  'bbb');
    const app = await createFunctionApp<Framework>(join(__dirname, 'fixtures/base-app-event-middleware'), {
      starter: new BootstrapStarter(),
      globalConfig: {
        faas: {
          initContext: {}
        }
      },
      imports: [
        require('../src'),
        require('./fixtures/base-app-event-middleware/src')
      ]
    });

    const helloService: any = await app.getServerlessInstance('helloService');

    let result = await helloService.handler({
      text: 'abc',
    });

    expect(result).toEqual('hello event3abc');

    // test event middleware
    result = await app.invokeTriggerFunction(
      {
        originContext: {},
        originEvent: {
          text: 'abc',
        }
      },
      'helloService.handler',
      {
      isHttpFunction: false,
    });

    expect(result).toEqual('hello event3abc');

    // test http
    result = await createHttpRequest(app).get('/test').query({
      name: 'zhangting',
      age: 3
    });

    expect(result.text).toEqual('hello http5');

    await closeApp(app);
    mm.restore();
  });

  it('should test middleware return value and body not empty', async () => {
    const starter = await createNewStarter('base-app-middleware-return-body');

    const result = await createHttpRequest(starter)
      .get('/');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('{"code":0,"msg":"ok","data":null}');

    const result1 = await createHttpRequest(starter)
      .get('/undefined');
    expect(result1.status).toEqual(200);
    expect(result1.text).toEqual('{"code":0,"msg":"ok"}');

    const result2 = await createHttpRequest(starter)
      .get('/null');
    expect(result2.status).toEqual(200);
    expect(result2.text).toEqual('{"code":0,"msg":"ok","data":null}');

    await closeApp(starter);
  });

  it('should test event decorator', async () => {
    const starter = await createNewStarter('base-app-event-decorator');

    const result = await starter.invokeTriggerFunction(
      {
        originContext: {},
        originEvent: {}
      },
      'helloService.handler',
      {
        isHttpFunction: false,
      });

    expect(result).toEqual({
      text: 'a',
    });

    const result2 = await createHttpRequest(starter)
      .get('/test');
    expect(result2.status).toEqual(200);
    expect(result2.text).toEqual('{"text":"a"}');

    await closeApp(starter);
  });
});
