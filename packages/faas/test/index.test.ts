import { join } from 'path';
import * as assert from 'assert';
import { FaaSStarter } from '../src/';
import { clearAllModule } from '@midwayjs/decorator';
import * as mm from 'mm';

describe('test/index.test.ts', () => {
  afterEach(() => {
    clearAllModule();
  });
  it('invoke handler by default name', async () => {
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app'),
      typescript: true,
    });
    await starter.start();
    const data = await starter.handleInvokeWrapper('index.handler')(
      {
        text: 'hello',
      },
      { text: 'a' }
    );
    assert(data === 'ahello');
  });

  it('invoke different handler use @Handler', async () => {
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-handler'),
      typescript: true,
    });
    await starter.start();
    assert(
      (await starter.handleInvokeWrapper('index.entry')(
        {
          text: 'hello',
        },
        { text: 'a' }
      )) === 'ahello'
    );
    assert(
      (await starter.handleInvokeWrapper('index.list')(
        {
          text: 'hello',
        },
        { text: 'a' }
      )) === 'ahello'
    );
  });

  it('use default handler and new handler', async () => {
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-handler2'),
      typescript: true,
    });
    await starter.start();
    assert(
      (await starter.handleInvokeWrapper('index.handler')(
        {
          text: 'hello',
        },
        { text: 'a' }
      )) === 'defaultahello'
    );
    assert(
      (await starter.handleInvokeWrapper('index.list')(
        {
          text: 'hello',
        },
        { text: 'ab' }
      )) === 'abhello'
    );
    assert(
      (await starter.handleInvokeWrapper('indexService.get')({}, {})) ===
        'hello'
    );
  });

  it('invoke handler by default name', async () => {
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-route'),
      typescript: true,
    });
    await starter.start();
    const data = await starter.handleInvokeWrapper('deploy.handler9')(
      {
        text: 'hello',
      },
      { text: 'ab' }
    );
    assert(data === 'abhello');
  });

  xit('deprecated: use ioc.js cover loadDir', async () => {
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-ioc'),
      typescript: true,
    });
    await starter.start();
    const data = await starter.handleInvokeWrapper('index.handler')(
      {
        text: 'hello',
      },
      { text: 'ab' }
    );
    assert(data === 'abhellotest');
  });

  it('use simple lock start should exec only once', async () => {
    const faas = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app'),
      typescript: true,
    });

    let i = 0;
    const cb = async () => {
      i++;
    };
    const arr = [faas.start({ cb }), faas.start({ cb }), faas.start({ cb })];
    await Promise.all(arr);
    assert(1 === i);
  });

  it('use new decorator and use function middleware', async () => {
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-new'),
      typescript: true,
    });
    await starter.start();
    const data = await starter.handleInvokeWrapper('index.handler')(
      {
        text: 'hello',
      },
      { text: 'ab' }
    );
    assert(data === 'abhello');
  });

  it('configuration test should be ok', async () => {
    mm(process.env, 'NODE_ENV', '');
    class TestFaaSStarter extends FaaSStarter {
      prepareConfiguration() {
        this.initConfiguration(
          join(__dirname, './configuration'),
          join(__dirname, 'fixtures/midway-plugin-mod')
        );
      }
    }
    const starter = new TestFaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-configuration'),
      typescript: true,
    });
    await starter.start();
    const data = await starter.handleInvokeWrapper('index.handler')(
      {},
      { text: 'ab' }
    );
    assert(data === '5321abone articlereplace managerprod');
    mm.restore();
  });

  it('test custom global middleware', async () => {
    const { start } = require('../../serverless-scf-starter/src');
    const runtime = await start();
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-middleware'),
      applicationAdapter: runtime,
    });
    await starter.start();
    const data = await runtime.asyncEvent(
      starter.handleInvokeWrapper('index.handler')
    )(
      {
        text: 'hello',
        httpMethod: 'GET',
        headers: {},
        requestContext: {},
      },
      { text: 'a' }
    );

    assert(data.body === 'ahello555');
  });

  it('test throw error from code and middleware catch it', async () => {
    const { start } = require('../../serverless-scf-starter/src');
    const runtime = await start();
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-middleware-err'),
      applicationAdapter: runtime,
    });
    await starter.start();
    const data = await runtime.asyncEvent(
      starter.handleInvokeWrapper('index.handler')
    )(
      {
        text: 'hello',
        httpMethod: 'GET',
        headers: {},
        requestContext: {},
      },
      { text: 'a' }
    );

    assert(data.body === 'ahello555');
  });

  it('test inject app and plugin', async () => {
    const { start } = require('../../serverless-scf-starter/src');
    const runtime = await start();
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-inject'),
      applicationAdapter: runtime,
    });
    // set app
    const app = runtime.getApplication();
    app.mysql = {
      model: '123',
    };
    await starter.start();
    const data = await runtime.asyncEvent(
      starter.handleInvokeWrapper('index.handler')
    )(
      {
        text: 'hello',
        httpMethod: 'GET',
        headers: {},
        requestContext: {},
      },
      { text: 'a' }
    );

    assert(data.body === 'ahello123');
  });

  it('test inject logger', async () => {
    const { start } = require('../../serverless-scf-starter/src');
    const runtime = await start();
    const starter = new FaaSStarter({
      baseDir: join(__dirname, './fixtures/base-app-inject-logger'),
      applicationAdapter: runtime,
    });
    await starter.start();
    const data = await runtime.asyncEvent(
      starter.handleInvokeWrapper('index.handler')
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
  });

  it('test midway-hooks', async () => {
    mm(process.env, 'NODE_ENV', 'sh');
    const starter = new FaaSStarter({
      baseDir: join(__dirname, 'fixtures/midway-hooks'),
    });
    await starter.start();
    const data1 = await starter.handleInvokeWrapper('index.handler')({}, {});
    const data2 = await starter.handleInvokeWrapper('inject.handler')({}, {});

    assert(data1);
    assert(data2);

    const config = await starter.handleInvokeWrapper('config.handler')({}, {});
    const applicationContext = starter.getApplicationContext();
    const value = applicationContext.getConfigService().getConfiguration('env');

    assert(config === value);

    const loggerExist = await starter.handleInvokeWrapper('logger.handler')(
      {},
      {}
    );
    assert(loggerExist);
  });
});
