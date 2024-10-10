import * as assert from 'assert';
import { creatStarter, closeApp } from './utils';

describe('test/index.test.ts', () => {

  it('invoke handler by default name', async () => {
    const starter = await creatStarter('base-app');
    const data = await starter.handleInvokeWrapper('helloService.handler')(
      {
        text: 'hello',
        originContext: {},
        originEvent: {},
      },
      { text: 'a' }
    );
    expect(data).toEqual('ahello');
  });

  it('invoke different handler use @Handler', async () => {
    const starter = await creatStarter('base-app-handler');
    assert.ok(
      (await starter.handleInvokeWrapper('indexService.handler')(
        {
          text: 'hello',
          originContext: {},
          originEvent: {},
        },
        { text: 'a' }
      )) === 'ahello'
    );
    assert.ok(
      (await starter.handleInvokeWrapper('indexService.getList')(
        {
          text: 'hello',
          originContext: {},
          originEvent: {},
        },
        { text: 'a' }
      )) === 'ahello'
    );
    await closeApp(starter);
  });

  it('use default handler and new handler', async () => {
    const starter = await creatStarter('base-app-handler2');
    assert.ok(
      (await starter.handleInvokeWrapper('indexService.handler')(
        {
          text: 'hello',
          originContext: {},
          originEvent: {},
        },
        { text: 'a' }
      )) === 'defaultahello'
    );
    assert.ok(
      (await starter.handleInvokeWrapper('indexService.getList')(
        {
          text: 'hello',
          originContext: {},
          originEvent: {},
        },
        { text: 'ab' }
      )) === 'abhello'
    );
    assert.ok(
      (await starter.handleInvokeWrapper('indexService.get')({}, {})) ===
        'hello'
    );
    await closeApp(starter);
  });

  it('invoke handler by another name', async () => {
    const starter = await creatStarter('base-app-route');
    const data = await starter.handleInvokeWrapper('helloService.handler')(
      {
        text: 'hello',
        originContext: {},
        originEvent: {},
      },
      { text: 'ab' }
    );
    assert.ok(data === 'abhello');
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
  //   assert.ok(1 === i);
  //   await closeApp(starter);
  // });

  it('use new decorator and use function middleware', async () => {
    const starter = await creatStarter('base-app-new');
    const data = await starter.handleInvokeWrapper('helloService.handler')(
      {
        text: 'hello',
        originContext: {},
        originEvent: {},
      },
      { text: 'ab' }
    );
    expect(data).toEqual('abhelloextra data');
    await closeApp(starter);
  });

  it('invoke controller handler', async () => {
    const starter = await creatStarter('base-app-controller');
    let data = await starter.handleInvokeWrapper('helloService.handler')(
      {
        text: 'hello',
        originContext: {},
        originEvent: {},
      },
      { text: 'a' }
    );
    expect(data).toEqual('ahello');

    let ctx = {
      text: 'hello',
      httpMethod: 'GET',
      headers: {},
      set(key, value) {
        ctx.headers[key] = value;
      },
      get(key) {},
      originContext: {},
      originEvent: {},
    }

    data = await starter.handleInvokeWrapper('apiController.homeSet')(
      ctx,
      { text: 'a' },
    );
    expect(data).toEqual('bbb');
    expect(ctx.headers['ccc']).toEqual('ddd');
    expect(ctx.headers['bbb']).toEqual('aaa');
  });
});
