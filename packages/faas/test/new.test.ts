import * as assert from 'assert';
import * as mm from 'mm';
import { createNewStarter, closeApp } from './utils';
import { createFunctionApp, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '../src';
import { join } from 'path';
import { BootstrapStarter } from '../../../packages-serverless/midway-fc-starter/src';

describe('test/new.test.ts', () => {

  it('invoke handler by default name', async () => {
    const starter = await createNewStarter('base-app');
    const data = await starter.getTriggerFunction('helloService.handler')(
      {
        text: 'hello',
      },
      {
        isHttpFunction: false,
        originContext: {},
        originEvent: { text: 'a' },
      }
    );
    expect(data).toEqual('ahello');
  });

  it('invoke different handler use @Handler', async () => {
    const starter = await createNewStarter('base-app-handler');
    assert(
      (await starter.getTriggerFunction('indexService.handler')(
        {
          text: 'hello',
        },
        {
          isHttpFunction: false,
          originContext: {},
          originEvent:  { text: 'a' }
        }
      )) === 'ahello'
    );
    assert(
      (await starter.getTriggerFunction('indexService.getList')(
        {
          text: 'hello',
          originContext: {},
          originEvent: {},
        },
        {
          isHttpFunction: false,
          originContext: {},
          originEvent:  { text: 'a' }
        }
      )) === 'ahello'
    );
    await closeApp(starter);
  });

  it('use default handler and new handler', async () => {
    const starter = await createNewStarter('base-app-handler2');
    assert(
      (await starter.getTriggerFunction('indexService.handler')(
        {
          text: 'hello',
          originContext: {},
          originEvent: {},
        },
        {
          isHttpFunction: false,
          originContext: {},
          originEvent:  { text: 'a' }
        }
      )) === 'defaultahello'
    );
    assert(
      (await starter.getTriggerFunction('indexService.getList')(
        {
          text: 'hello',
          originContext: {},
          originEvent: {},
        },
        {
          isHttpFunction: false,
          originContext: {},
          originEvent:  { text: 'ab' }
        }
      )) === 'abhello'
    );
    assert(
      (await starter.getTriggerFunction('indexService.get')({}, {
        isHttpFunction: false,
        originEvent: undefined,
        originContext: undefined
      })) ===
        'hello'
    );
    await closeApp(starter);
  });

  it('invoke handler by another name', async () => {
    const starter = await createNewStarter('base-app-route');
    const data = await starter.getTriggerFunction('helloService.handler')(
      {
        text: 'hello',
        originContext: {},
        originEvent: {},
      },
      {
        isHttpFunction: false,
        originContext: {},
        originEvent:  { text: 'ab' }
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
    const data = await starter.getTriggerFunction('helloService.handler')(
      {
        text: 'hello',
        originContext: {},
        originEvent: {},
      },
      {
        isHttpFunction: false,
        originContext: {},
        originEvent:  { text: 'ab' }
      }
    );
    expect(data).toEqual('abhelloextra data');
    await closeApp(starter);
  });

  it('test inject logger', async () => {
    const { start } = require('@midwayjs/serverless-scf-starter');
    const runtime = await start();
    const starter = await createNewStarter('base-app-inject-logger', {
      applicationAdapter: runtime,
    });

    const data = await runtime.asyncEvent(
      starter.getTriggerFunction('helloService.handler')
    )(
      {
        text: 'hello',
        httpMethod: 'GET',
        headers: {},
        requestContext: {},
      },
      { text: 'a' }
    );

    assert(data.body === 'hello world');
    await closeApp(starter);
  });

  it('invoke controller handler', async () => {
    const starter = await createNewStarter('base-app-controller');
    let data = await starter.getTriggerFunction('helloService.handler')(
      {
        text: 'hello',
        originContext: {},
        originEvent: {},
      },
      {
        isHttpFunction: false,
        originContext: {},
        originEvent:  { text: 'a' }
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

    expect(result).toEqual('hello eventundefined');

    // test event middleware
    const handlerFn = app.getTriggerFunction('helloService.handler');

    result = await handlerFn({}, {
      isHttpFunction: false,
      originContext: {},
      originEvent: {
        text: 'abc',
      }
    });

    expect(result).toEqual('hello event3');

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

  it('should test dynamic function', async () => {
    const starter = await createNewStarter('base-app-dynamic-function');

    let result = await createHttpRequest(starter)
      .get('/api/user')
      .query({
        name: 'zhangting',
      });
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world,zhangting');

    const handler = await starter.getTriggerFunction('event.handler');
    result = await handler({}, {
      isHttpFunction: false,
      originEvent: {
        text: 'zhangting',
      },
      originContext: {}
    });
    expect(result).toEqual('zhangtinghello world');

    await closeApp(starter);
  });
});
